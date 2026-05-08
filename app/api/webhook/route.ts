import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { validateWebhookRequest, logWebhookAttempt } from '@/lib/webhook-security'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

  // 1. Validate webhook request (pre-checks)
  const securityCheck = validateWebhookRequest(request)
  
  if (!securityCheck.valid) {
    await logWebhookAttempt('failure', {
      ip: clientIP,
      reason: securityCheck.reason,
    })
    
    return NextResponse.json(
      { error: securityCheck.reason },
      { status: 403 }
    )
  }

  // 2. Get signature and body
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    await logWebhookAttempt('failure', {
      ip: clientIP,
      reason: 'No signature header',
    })
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // 3. Verify Stripe signature (PRIMARY SECURITY)
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    await logWebhookAttempt('failure', {
      ip: clientIP,
      signature: sig.substring(0, 20) + '...',
      reason: `Signature verification failed: ${err.message}`,
    })

    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    )
  }

  // 4. Check for replay attacks (idempotency)
  const eventId = event.id
  const { data: existingEvent } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single()

  if (existingEvent) {
    await logWebhookAttempt('failure', {
      ip: clientIP,
      eventType: event.type,
      reason: 'Duplicate event (replay attack?)',
    })

    return NextResponse.json({ received: true }) // Return 200 to avoid Stripe retries
  }

  // 5. Log successful webhook
  await logWebhookAttempt('success', {
    ip: clientIP,
    eventType: event.type,
  })

  // 6. Record event as processed
  await supabase.from('processed_webhook_events').insert({
    stripe_event_id: eventId,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  })

  // 7. Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { skillId, userId } = session.metadata || {}

      if (!skillId || !userId) {
        console.error('Missing metadata in checkout session')
        break
      }

      // Create purchase record
      await supabase.from('purchases').insert({
        buyer_id: userId,
        skill_id: skillId,
        amount: (session.amount_total || 0) / 100,
        stripe_payment_id: session.payment_intent as string,
      })

      // Increment download count
      const { data: skill } = await supabase
        .from('skills')
        .select('download_count')
        .eq('id', skillId)
        .single()

      if (skill) {
        await supabase
          .from('skills')
          .update({ download_count: skill.download_count + 1 })
          .eq('id', skillId)
      }

      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('seller_subscriptions')
        .upsert({
          stripe_subscription_id: subscription.id,
          status: subscription.status === 'active' ? 'active' : 
                  subscription.status === 'past_due' ? 'past_due' : 'canceled',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('seller_subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

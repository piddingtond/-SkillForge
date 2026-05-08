import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { stripe, TEST_MODE } from '@/lib/stripe'
import { sanitizeError } from '@/lib/errors'
import { auditLog } from '@/lib/audit-log'
import { checkRateLimit, purchaseRateLimit, getIdentifier } from '@/lib/ratelimit'

const CheckoutRequestSchema = z.object({
  skillId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  // Rate limit first — cheapest check
  const identifier = getIdentifier(request)
  const rl = await checkRateLimit(purchaseRateLimit, identifier)

  if (!rl.success) {
    await auditLog('rate_limit_hit', null, { route: 'checkout', identifier })
    return NextResponse.json(
      { error: 'Too many purchase attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    )
  }

  try {
    // Auth: read user from server session, never trust body for identity
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    // Input validation
    const body = await request.json()
    const validation = CheckoutRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { skillId } = validation.data

    // Fetch skill — only approved skills are purchasable
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('id, name, description, price, status')
      .eq('id', skillId)
      .single()

    if (skillError || !skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    if (skill.status !== 'approved') {
      return NextResponse.json({ error: 'This skill is not available for purchase' }, { status: 400 })
    }

    // Prevent double purchase
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('skill_id', skillId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You already own this skill' }, { status: 409 })
    }

    if (TEST_MODE) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      return NextResponse.json({ sessionId: `test_session_${skillId}`, url: `${baseUrl}/purchase-success?test=1&skillId=${skillId}` })
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: skill.name, description: skill.description },
            unit_amount: Math.round(skill.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL}/skills/${skillId}`,
      metadata: { skillId, userId },
    })

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (error) {
    console.error('[checkout]', error)
    await auditLog('failed_checkout', null, { ip: identifier })
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

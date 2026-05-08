import { NextRequest, NextResponse } from 'next/server'
import { stripe, TEST_MODE } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { tierId, userId, tierName, price } = await request.json()

    if (TEST_MODE) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      return NextResponse.json({ url: `${baseUrl}/dashboard?subscription=success&test=1` })
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierName} Subscription`,
              description: `OpenClaw Skills Marketplace - ${tierName} Tier`,
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
      metadata: {
        tierId,
        userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

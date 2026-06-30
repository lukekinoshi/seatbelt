import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, driverId, tripId } = await req.json()

    // Amount in cents
    const amountInCents = Math.round(amount * 100)
    
    // SeatBelt takes 5% total (2.5% from rider already built into amount)
    // Driver receives amount minus 2.5%
    const applicationFee = Math.round(amountInCents * 0.05)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        trip_id: tripId,
        driver_id: driverId,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      applicationFee,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
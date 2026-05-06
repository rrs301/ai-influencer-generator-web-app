import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!['standard', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    let unit_amount = 0;
    if (plan === 'standard') {
      unit_amount = 999; // $9.99
    } else if (plan === 'pro') {
      unit_amount = 2999; // $29.99
    }

    // Determine the host for redirect URLs
    const host = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AI Influencer ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: plan === 'standard' ? '2000 Credits/month, 5 Social Accounts' : '10000 Credits/month, Unlimited Social Accounts',
            },
            unit_amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        plan: plan,
      },
      success_url: `${host}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${host}/dashboard/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

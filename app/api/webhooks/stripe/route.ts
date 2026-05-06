import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && plan) {
        // Fetch current profile to get current credits
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        const currentCredits = profile?.credits || 0;
        let creditsToAdd = 0;
        if (plan === 'standard') creditsToAdd = 2000;
        if (plan === 'pro') creditsToAdd = 10000;

        await adminSupabase
          .from('profiles')
          .update({
            plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            credits: currentCredits + creditsToAdd,
          })
          .eq('id', userId);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;

      // If billing_reason is subscription_create, we already handled it in checkout.session.completed
      if (invoice.billing_reason === 'subscription_cycle') {
        const subscriptionId =
          typeof invoice.parent === 'object' && invoice.parent?.subscription_details?.subscription
            ? invoice.parent.subscription_details.subscription
            : null;

        if (!subscriptionId) {
          return NextResponse.json({ received: true });
        }

        // Find user by subscription ID
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id, plan, credits')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (profile) {
          const currentCredits = profile.credits || 0;
          let creditsToAdd = 0;
          if (profile.plan === 'standard') creditsToAdd = 2000;
          if (profile.plan === 'pro') creditsToAdd = 10000;

          if (creditsToAdd > 0) {
            await adminSupabase
              .from('profiles')
              .update({
                credits: currentCredits + creditsToAdd,
              })
              .eq('id', profile.id);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

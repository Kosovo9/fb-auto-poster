import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (userId) {
                // Update user with subscription info
                await supabase
                    .from('users')
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan: 'premium' // Default premium on success
                    })
                    .eq('id', userId);

                // Track in subscriptions table
                await supabase
                    .from('subscriptions')
                    .insert([{
                        user_id: userId,
                        stripe_id: subscriptionId,
                        status: 'active',
                        plan: 'premium'
                    }]);
            }
            break;

        case 'customer.subscription.deleted':
            const subDeleted = event.data.object as Stripe.Subscription;
            await supabase
                .from('users')
                .update({ plan: 'free' })
                .eq('stripe_subscription_id', subDeleted.id);
            break;

        case 'invoice.payment_failed':
            // Logic for failed payment
            break;
    }

    return NextResponse.json({ received: true });
}

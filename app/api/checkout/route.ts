import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        const { priceId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Mapping or fallbacks to env vars
        const validPrices = [
            process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
            process.env.STRIPE_PRICE_BUSINESS || 'price_business',
            process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise'
        ];

        // For flexibility, if it matches a placeholder name we also allow it during testing
        const finalPriceId = priceId.startsWith('price_') ? priceId :
            (priceId === 'professional' ? validPrices[0] :
                priceId === 'business' ? validPrices[1] : validPrices[2]);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: finalPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=cancel`,
            client_reference_id: userId,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Error creando sesión de pago' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import * as paypal from '@paypal/checkout-server-sdk';
import { client } from '@/lib/payments/paypal';

export async function POST(req: NextRequest) {
    try {
        const { plan, userId } = await req.json();

        // Plan pricing
        const price = plan === 'business' ? "49.00" : (plan === 'enterprise' ? "149.00" : "19.00");

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: price
                },
                description: `Plan ${plan.toUpperCase()} – FB Auto Poster`,
                custom_id: userId
            }]
        });

        const response = await client().execute(request);

        return NextResponse.json({ id: response.result.id });
    } catch (error) {
        console.error('PayPal Create Order Error:', error);
        return NextResponse.json({ error: 'Error al crear orden de PayPal' }, { status: 500 });
    }
}

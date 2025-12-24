import { NextRequest, NextResponse } from 'next/server';

// PayPal API endpoint
const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'USD', plan } = await req.json();

        // Si tenemos el Hosted Button ID, redirigir directamente
        if (process.env.PAYPAL_HOSTED_BUTTON_ID) {
            return NextResponse.json({
                redirectUrl: `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${process.env.PAYPAL_HOSTED_BUTTON_ID}`,
                method: 'hosted_button'
            });
        }

        // Crear orden via API
        const accessToken = await getPayPalAccessToken();

        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toString(),
                    },
                    description: `FB Auto-Poster - Plan ${plan || 'Professional'}`,
                }],
                application_context: {
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/dashboard?status=success&provider=paypal`,
                    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/dashboard?status=cancelled`,
                },
            }),
        });

        const order = await response.json();

        if (order.error) {
            throw new Error(order.error_description || 'PayPal order creation failed');
        }

        const approveLink = order.links?.find((link: any) => link.rel === 'approve');

        return NextResponse.json({
            orderId: order.id,
            approvalUrl: approveLink?.href,
            status: order.status,
        });
    } catch (error: any) {
        console.error('PayPal error:', error);
        return NextResponse.json(
            { error: error.message || 'Error creating PayPal order' },
            { status: 500 }
        );
    }
}

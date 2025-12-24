import { NextRequest, NextResponse } from 'next/server';

const MERCADOPAGO_API = 'https://api.mercadopago.com';

export async function POST(req: NextRequest) {
    try {
        const { amount, title, plan } = await req.json();

        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

        if (!accessToken) {
            throw new Error('Mercado Pago access token not configured');
        }

        const preference = {
            items: [{
                title: title || `FB Auto-Poster - Plan ${plan || 'Professional'}`,
                quantity: 1,
                unit_price: Number(amount),
                currency_id: 'MXN', // Mexican Pesos
            }],
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/dashboard?status=success&provider=mercadopago`,
                failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/dashboard?status=failed`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/dashboard?status=pending`,
            },
            auto_return: 'approved',
            notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://frolicking-figolla-368d89.netlify.app'}/api/mercadopago/webhook`,
        };

        const response = await fetch(`${MERCADOPAGO_API}/checkout/preferences`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preference),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message || 'Mercado Pago preference creation failed');
        }

        return NextResponse.json({
            preferenceId: data.id,
            initPoint: data.init_point,
            sandboxInitPoint: data.sandbox_init_point,
        });
    } catch (error: any) {
        console.error('Mercado Pago error:', error);
        return NextResponse.json(
            { error: error.message || 'Error creating Mercado Pago preference' },
            { status: 500 }
        );
    }
}

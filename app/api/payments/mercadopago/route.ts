import { NextRequest, NextResponse } from 'next/server';
import { createPreference } from '@/lib/payments/mercadopago';

export async function POST(req: NextRequest) {
    try {
        const { plan, userId } = await req.json();

        if (!plan || !userId) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        const initPoint = await createPreference(plan, userId);

        return NextResponse.json({ url: initPoint });
    } catch (error) {
        console.error('MP Create Preference Error:', error);
        return NextResponse.json({ error: 'Error al crear preferencia de MercadoPago' }, { status: 500 });
    }
}

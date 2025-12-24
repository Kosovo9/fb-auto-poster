import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || req.headers.get('x-topic');
        const id = url.searchParams.get('id') || req.headers.get('x-id');

        console.log('MP Webhook received:', { topic, id });

        if (topic === 'payment' || topic === 'merchant_order') {
            // In a real scenario, we would verify the payment with MercadoPago API
            // For now, we assume it's valid if called correctly

            // Assume the external_reference is the userId
            // const userId = ... (fetch from MP API using id)

            // Update plan in Supabase
            // await supabase.from('users').update({ plan: 'business' }).eq('id', userId);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('MP Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

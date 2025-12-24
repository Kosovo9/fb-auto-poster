import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const eventType = body.event_type;

        console.log('PayPal Webhook received:', eventType);

        if (eventType === 'PAYMENT.SALE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
            const userId = body.resource?.custom_id || body.resource?.purchase_units?.[0]?.custom_id;

            if (userId) {
                const { error } = await supabase
                    .from('users')
                    .update({ plan: 'business' })
                    .eq('id', userId);

                if (error) console.error('Error updating plan:', error);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

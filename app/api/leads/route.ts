import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { extractLeadFromComment } from '../../lib/lead-extractor';
import { sendWhatsAppMessage } from '../../lib/whatsapp';

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        const userPlan = req.headers.get('x-user-plan');

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (userPlan !== 'enterprise' && userPlan !== 'business') {
            return NextResponse.json({ error: 'Upgrade to Business/Enterprise to extract leads' }, { status: 403 });
        }

        const { comment, scheduleId } = await req.json();

        // 1. Extract Lead using Gemini
        const leadData = await extractLeadFromComment(comment);

        // 2. Save Lead info
        const { data: lead, error } = await supabase
            .from('leads')
            .insert([{
                user_id: userId,
                schedule_id: scheduleId,
                name: leadData.name,
                phone: leadData.phone,
                comment_text: comment,
                intent: leadData.intent
            }])
            .select()
            .single();

        if (error) throw error;

        // 3. Auto-WhatsApp if Enterprise and phone exists
        if (userPlan === 'enterprise' && leadData.phone && leadData.intent === 'buy') {
            const message = `¡Hola ${leadData.name || 'amigo'}! Gracias por tu interés en nuestro anuncio. ¿En qué puedo ayudarte hoy?`;
            const sent = await sendWhatsAppMessage(leadData.phone, message);
            if (sent) {
                await supabase.from('leads').update({ whatsapp_sent: true }).eq('id', lead.id);
            }
        }

        return NextResponse.json(lead);
    } catch (error) {
        console.error('POST /api/leads:', error);
        return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 });
    }
}

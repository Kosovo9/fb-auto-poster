import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { generateSpintaxVariations } from '../../lib/spintax-generator';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('schedules')
            .select('*, groups(*)')
            .eq('user_id', userId)
            .order('scheduled_time', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('GET /api/schedules:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedules' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { group_id, message, scheduled_time, use_ai, media_url } = await req.json();

        if (!group_id || !message || !scheduled_time) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Apply Spintax transformation
        let finalMessage = message;
        if (message.includes('{')) {
            const variations = generateSpintaxVariations(message, 1);
            finalMessage = variations[0];
        }

        const { data, error } = await supabase
            .from('schedules')
            .insert([{
                group_id,
                user_id: userId,
                message: finalMessage,
                scheduled_time,
                status: 'pending',
                use_ai: use_ai || false,
                media_url: media_url || null
            }])
            .select();

        if (error) throw error;
        return NextResponse.json(data?.[0] || {});
    } catch (error) {
        console.error('POST /api/schedules:', error);
        return NextResponse.json(
            { error: 'Failed to schedule post' },
            { status: 500 }
        );
    }
}

import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('schedules')
            .select('*, groups(*)')
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
        const { group_id, message, scheduled_time, use_ai, media_url } = await req.json();

        if (!group_id || !message || !scheduled_time) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('schedules')
            .insert([{
                group_id,
                message,
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

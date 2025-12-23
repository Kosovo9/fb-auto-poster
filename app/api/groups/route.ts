import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('GET /api/groups:', error);
        return NextResponse.json(
            { error: 'Failed to fetch groups' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { url, name } = await req.json();

        if (!url || !name) {
            return NextResponse.json(
                { error: 'Missing url or name' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('groups')
            .insert([{ url, name, user_id: userId }])
            .select();

        if (error) throw error;
        return NextResponse.json(data?.[0] || {});
    } catch (error) {
        console.error('POST /api/groups:', error);
        return NextResponse.json(
            { error: 'Failed to add group' },
            { status: 500 }
        );
    }
}

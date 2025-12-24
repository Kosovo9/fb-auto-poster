import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('GET /api/groups:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get plan from Clerk metadata (passed via sessionClaims)
        const plan = (sessionClaims?.metadata as any)?.plan || 'professional';

        const { url, name } = await req.json();
        if (!url || !name) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        // Enforce Limits
        const limit = plan === 'business' || plan === 'enterprise' ? 1000 : 10;
        const { count } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('user_id', userId);

        if (count !== null && count >= limit) {
            return NextResponse.json({ error: `Plan limit reached (${limit}). Upgrade for more.` }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('groups')
            .insert([{ url, name, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('POST /api/groups:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

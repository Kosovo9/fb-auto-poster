import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            // Demo data for non-logged or unauthorized
            return NextResponse.json({
                totalPostsPublished: 1254,
                totalCommentsReceived: 18450,
                totalConversions: 842,
                estimatedRevenue: 1545000,
                engagementRate: 24.8
            });
        }

        const { data, error } = await supabase
            .from('analytics')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // Default stats for new users
            return NextResponse.json({
                totalPostsPublished: 0,
                totalCommentsReceived: 0,
                totalConversions: 0,
                estimatedRevenue: 0,
                engagementRate: 0
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('GET /api/analytics:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { type, value } = await req.json();

        // Atomic update in Supabase (simplified)
        const { data, error } = await supabase.rpc('increment_analytics', {
            u_id: userId,
            column_name: type,
            inc_value: value || 1
        });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/analytics:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 🚀 OPTIMIZACIÓN 10X: Fetch agregados directamente si es posible
        // Por ahora, usamos una query filtrada eficiente con el índice que creamos
        const { data: metrics, error } = await supabase
            .from('analytics')
            .select('metric_type, value')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString());

        if (error) throw error;

        const stats = {
            totalPostsPublished: 0,
            totalCommentsReceived: 0,
            totalConversions: 0,
            estimatedRevenue: 0,
            engagementRate: 0,
        };

        // Procesamiento ultra-rápido
        if (metrics) {
            for (let i = 0; i < metrics.length; i++) {
                const m = metrics[i];
                switch (m.metric_type) {
                    case 'post_published': stats.totalPostsPublished += m.value; break;
                    case 'comment_received': stats.totalCommentsReceived += m.value; break;
                    case 'conversion':
                        stats.totalConversions += m.value;
                        stats.estimatedRevenue += m.value * 45000; // Value in cents
                        break;
                }
            }
        }

        stats.engagementRate = stats.totalPostsPublished > 0
            ? (stats.totalCommentsReceived / stats.totalPostsPublished) * 100
            : 0;

        return NextResponse.json(stats);
    } catch (error) {
        console.error('GET /api/analytics:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { metricType, value, metadata } = await req.json();

        // 🚀 OPTIMIZACIÓN 10X: Insert async sin esperar (Fire and forget if not critical)
        // Pero para analíticas, mejor asegurar.
        const { error } = await supabase.from('analytics').insert([
            {
                user_id: userId,
                metric_type: metricType,
                value: value || 1,
                metadata: metadata || {},
            },
        ]);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/analytics:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

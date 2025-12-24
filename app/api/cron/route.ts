import { supabase } from '@/lib/supabase';
import { postToFacebookGroup } from '@/lib/playwright-bot';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // 10x Performance: Fetch more per batch now that we have indexes
        const { data: schedules, error } = await supabase
            .from('schedules')
            .select('*, groups(*)')
            .eq('status', 'pending')
            .lte('scheduled_time', now.toISOString())
            .limit(10);

        if (error) throw error;
        if (!schedules || schedules.length === 0) {
            return NextResponse.json({ success: true, message: 'No pending schedules' });
        }

        // Parallel execution with Promise.allSettled for reliability
        const results = await Promise.allSettled(
            schedules.map(async (schedule) => {
                const result = await postToFacebookGroup({
                    groupUrl: schedule.groups.url,
                    message: schedule.message,
                    useAI: schedule.use_ai,
                    mediaUrls: schedule.media_url ? [schedule.media_url] : [],
                });

                if (result.success) {
                    // Optimized Updates
                    await Promise.all([
                        supabase.from('schedules').update({ status: 'posted' }).eq('id', schedule.id),
                        supabase.from('analytics').insert({
                            user_id: schedule.user_id,
                            metric_type: 'post_published',
                            value: 1,
                            metadata: { group_name: schedule.groups.name }
                        })
                    ]);
                    return { id: schedule.id, status: 'success' };
                } else {
                    const retryCount = (schedule.retry_count || 0) + 1;
                    const finalStatus = retryCount >= 3 ? 'failed' : 'pending';

                    await supabase.from('schedules').update({
                        status: finalStatus,
                        retry_count: retryCount
                    }).eq('id', schedule.id);

                    return { id: schedule.id, status: 'failed', error: result.message };
                }
            })
        );

        return NextResponse.json({
            success: true,
            processed: results.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron Nuclear Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

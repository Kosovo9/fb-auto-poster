import { supabase } from '../../lib/supabase';
import { postToFacebookGroup } from '../../lib/playwright-bot';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
        console.warn('Unauthorized cron access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        const { data: schedules, error } = await supabase
            .from('schedules')
            .select('*, groups(*)')
            .eq('status', 'pending')
            .lte('scheduled_time', now.toISOString())
            .limit(5);

        if (error) throw error;

        const results = [];

        for (const schedule of schedules || []) {
            try {
                const result = await postToFacebookGroup({
                    groupUrl: schedule.groups.url,
                    message: schedule.message,
                    useAI: schedule.use_ai,
                    mediaUrls: schedule.media_url ? [schedule.media_url] : [],
                });

                if (result.success) {
                    await supabase
                        .from('schedules')
                        .update({ status: 'posted' })
                        .eq('id', schedule.id);

                    // --- LOG ANALYTICS ---
                    await supabase.from('analytics').insert({
                        user_id: schedule.user_id, // Ensure user_id exists in schedules or groups
                        metric_type: 'post_published',
                        value: 1,
                        metadata: { group_name: schedule.groups.name }
                    });
                    // --------------------

                    await supabase.from('post_logs').insert({
                        schedule_id: schedule.id,
                        group_id: schedule.group_id,
                        status: 'success',
                    });

                    results.push({
                        id: schedule.id,
                        status: 'success',
                        group: schedule.groups.name,
                    });
                } else {
                    // Check retry count (assuming 0 if not exists)
                    const retryCount = (schedule.retry_count || 0);
                    if (retryCount < 3) {
                        await supabase
                            .from('schedules')
                            .update({ retry_count: retryCount + 1 })
                            .eq('id', schedule.id);
                    } else {
                        await supabase
                            .from('schedules')
                            .update({ status: 'failed' })
                            .eq('id', schedule.id);
                    }

                    await supabase.from('post_logs').insert({
                        schedule_id: schedule.id,
                        group_id: schedule.group_id,
                        status: 'failed',
                        error_message: result.message,
                    });

                    results.push({
                        id: schedule.id,
                        status: 'failed',
                        error: result.message,
                        group: schedule.groups.name,
                    });
                }
            } catch (postError) {
                console.error('Post error for schedule', schedule.id, postError);
                results.push({
                    id: schedule.id,
                    status: 'error',
                    error: postError instanceof Error ? postError.message : 'Unknown',
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron execution error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

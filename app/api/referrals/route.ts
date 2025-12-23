import { supabase } from '../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: user } = await supabase
            .from('users')
            .select('referral_code')
            .eq('id', userId)
            .single();

        const { data: referrals } = await supabase
            .from('referrals')
            .select('id, referred_id, commission_amount, created_at, status')
            .eq('referrer_id', userId);

        const totalEarned = (referrals || []).reduce((acc, curr) => acc + curr.commission_amount, 0);

        return NextResponse.json({
            referralCode: user?.referral_code,
            referrals: referrals || [],
            totalEarned: totalEarned / 100 // convert cents to dollars
        });
    } catch (error) {
        console.error('GET /api/referrals:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

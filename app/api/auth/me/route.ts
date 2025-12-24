import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'fb-autoposter-secret-2024';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

        // Get user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, plan, role, created_at')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            plan: user.plan || 'free',
            role: user.role || 'user',
            created_at: user.created_at,
        });

    } catch (error: any) {
        console.error('Auth/me error:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

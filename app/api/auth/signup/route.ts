import { supabase } from '../../../lib/supabase';
import { hashPassword } from '../../../lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password_hash: hashedPassword, plan: 'free' }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'User created successfully', user: { id: data.id, email: data.email } });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

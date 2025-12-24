import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fb-autoposter-secret-2024');

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. PUBLIC PATHS
    const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/favicon.ico' ||
        pathname === '/globals.css';

    if (isPublic) {
        return NextResponse.next();
    }

    // 2. AUTH PROTECTION
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', request.url);
        // Important: return redirect
        return NextResponse.redirect(loginUrl);
    }

    // 3. TOKEN VALIDATION
    const payload = await verifyToken(token);
    if (!payload) {
        const response = pathname.startsWith('/api/')
            ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
            : NextResponse.redirect(new URL('/login', request.url));

        response.cookies.delete('auth_token');
        return response;
    }

    // 4. ADMIN PROTECTION
    if (pathname.startsWith('/admin-secret-panel')) {
        const role = payload.role as string;
        const email = payload.email as string;
        if (role !== 'admin' && !email.includes('admin')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 5. SUCCESS
    const response = NextResponse.next();
    response.headers.set('x-user-id', (payload.userId as string) || '');
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

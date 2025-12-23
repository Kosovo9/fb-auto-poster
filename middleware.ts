import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './app/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths
    if (pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/') {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Pass user info in headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.id);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-plan', payload.plan);

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/groups/:path*',
        '/api/schedules/:path*',
        '/api/analytics/:path*',
        '/api/upload/:path*',
        '/api/checkout/:path*'
    ],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Define public routes (handling optional locale prefix)
const isPublicRoute = createRouteMatcher([
    '/',
    '/(en|es|pt|fr|de|it|nl|pl|tr|ru|zh|ja|ko|ar|hi)',
    '/(en|es|pt|fr|de|it|nl|pl|tr|ru|zh|ja|ko|ar|hi)/login(.*)',
    '/(en|es|pt|fr|de|it|nl|pl|tr|ru|zh|ja|ko|ar|hi)/signup(.*)',
    '/login(.*)',
    '/signup(.*)',
    '/api/summary(.*)',
    '/api/webhooks(.*)',
    '/robots.txt',
    '/sitemap.xml'
]);

// Anti-Bot UA List
const BANNED_UA = [
    'GPTBot', 'ChatGPT-User', 'Claude-Web', 'CCBot', 'Google-Extended',
    'Bytespider', 'scrapy', 'wget', 'curl', 'httrack'
];

export default clerkMiddleware(async (auth, req) => {
    const ua = req.headers.get('user-agent') || '';

    // 1. Anti-Bot / Anti-Scraping / GEO Block
    const isBot = BANNED_UA.some(bot => ua.includes(bot));
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || '';
    const isBannedCountry = ['RU', 'CN'].includes(country);

    if (isBot || isBannedCountry) {
        return new NextResponse('Access Denied', { status: 403 });
    }

    // 2. Auth Protection
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 3. Handle I18n Routing
    const response = handleI18nRouting(req);

    // 4. Security Headers & GEO/SEO Tags
    if (!isPublicRoute(req)) {
        response.headers.set('X-Robots-Tag', 'noai, noimageai, noindex, nofollow');
    }

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Updated CSP to be more flexible for locales and Clerk
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.nexorapro.lat https://www.paypal.com https://www.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.accounts.dev https://*.supabase.co https://*.google.com;");

    return response;
});

export const config = {
    // Matcher excluding common static files correctly
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};

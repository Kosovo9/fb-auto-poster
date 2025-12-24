import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get('lang') || 'en';

    try {
        const messages = (await import(`../../../messages/${lang}.json`)).default;
        return new NextResponse(messages.common.disclaimer, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    } catch {
        return new NextResponse("FB Auto Poster is an independent automation tool...", {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

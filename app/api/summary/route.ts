import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get('lang') || 'en';

    const summaries: Record<string, string> = {
        en: `# FB Auto Poster PRO Summary
        - **Objective**: Automate Facebook Groups posting and response management.
        - **Core Features**: Master Scheduler, AI Gemini Auto-Reply, Spintax variation, Multi-media support.
        - **Pricing**: Free (Limited), Pro ($19/mo), Business ($49/mo), Enterprise ($149/mo).
        - **Technology**: Next.js 15, Clerk Auth, Supabase DB.
        - **SEO**: 15 Languages supported, JSON-LD Schema integrated.`,

        es: `# Resumen de FB Auto Poster PRO
        - **Objetivo**: Automatizar publicaciones y gestión de respuestas en Grupos de Facebook.
        - **Funciones**: Programador Maestro, Auto-Reply con IA Gemini, Variaciones Spintax, Soporte Multimedia.
        - **Precios**: Gratis (Limitado), Pro ($19/mes), Business ($49/mes), Enterprise ($149/mes).
        - **Tecnología**: Next.js 15, Clerk Auth, Supabase DB.
        - **SEO**: 15 idiomas soportados, Esquema JSON-LD integrado.`,

        pt: `# Resumo do FB Auto Poster PRO
        - **Objetivo**: Automatizar postagens e gerenciamento de respostas em Grupos do Facebook.
        - **Recursos**: Agendador Mestre, Auto-Reply com IA Gemini, Variações Spintax, Suporte Multimídia.
        - **Preços**: Grátis (Limitado), Pro ($19/mês), Business ($49/mês), Enterprise ($149/mês).
        - **Tecnologia**: Next.js 15, Clerk Auth, Supabase DB.
        - **SEO**: 15 idiomas suportados, Esquema JSON-LD integrado.`
    };

    const content = summaries[lang] || summaries['en'];

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600'
        }
    });
}

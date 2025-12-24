import type { Metadata } from 'next';
import '../globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata.home' });

    return {
        title: t('title'),
        description: t('description'),
        keywords: ['fb auto poster', 'facebook group scheduler', 'marketing automation', 'ai lead extraction'],
        authors: [{ name: 'Antigravity Nuclear Mode' }],
        alternates: {
            canonical: `https://nexorapro.lat/${locale}`,
            languages: routing.locales.reduce((acc: Record<string, string>, l: string) => ({ ...acc, [l]: `https://nexorapro.lat/${l}` }), {}),
        },
        openGraph: {
            title: t('title'),
            description: t('description'),
            images: ['https://nexorapro.lat/og-image.jpg'],
        },
        robots: {
            index: true,
            follow: true,
            nocache: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <ClerkProvider>
            <html lang={locale} className="dark" suppressHydrationWarning>
                <head />
                <body className="antialiased selection:bg-blue-500/30">
                    <NextIntlClientProvider messages={messages}>
                        <div className="min-h-screen bg-slate-950">
                            {children}
                        </div>
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

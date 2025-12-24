import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fbautoposterpro.com';

    const locales = ['en', 'es', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'tr', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];

    return locales.map(locale => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: locale === 'en' ? 1 : 0.8,
    }));
}

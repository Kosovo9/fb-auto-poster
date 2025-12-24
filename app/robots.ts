import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'CCBot', 'Google-Extended'],
                disallow: '/', // Anti-AI Scraping for training data
            },
            {
                userAgent: 'Bytespider',
                disallow: '/', // Anti-Bytedance scraping
            }
        ],
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
    };
}

'use client';

import { usePathname, useRouter, routing } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇲🇽' },
        { code: 'pt', label: 'Português', flag: '🇧🇷' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
        { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
        { code: 'pl', label: 'Polski', flag: '🇵🇱' },
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'ko', label: '한국어', flag: '🇰🇷' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ];

    const handleSwitch = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
        setIsOpen(false);
    };

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    return (
        <div className="relative z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl hover:bg-slate-800 transition-all group"
            >
                <span className="text-xl">{currentLang.flag}</span>
                <span className="text-[10px] font-black tracking-widest text-slate-400 group-hover:text-white uppercase">{currentLang.code}</span>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl grid grid-cols-2 gap-2 min-w-[280px] max-h-[400px] overflow-y-auto">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSwitch(lang.code)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${locale === lang.code ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Deprecated providers/hooks to avoid breaking build while transitioning
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
export function useLanguage() {
    return { language: 'en', t: {} as any, setLanguage: () => { } };
}

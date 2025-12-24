'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../context/LanguageContext'; // We'll update this too

// Anti-Copy Component for sensitive text
function AntiCopy({ text }: { text: string }) {
    if (!text) return null;
    return (
        <span style={{ userSelect: 'none' }}>
            {text.split('').map((c, i) => (
                <span key={i}>{c + '\u200B'}</span>
            ))}
        </span>
    );
}

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const PLANS = [
        {
            id: 'professional',
            name: t('pricing.professional.name'),
            price: '19',
            tagline: t('pricing.professional.tagline'),
            features: [
                t('pricing.professional.feature1'),
                t('pricing.professional.feature2'),
                t('pricing.professional.feature3'),
                t('pricing.professional.feature4')
            ],
            cta: t('pricing.professional.cta'),
            highlight: false
        },
        {
            id: 'business',
            name: t('pricing.business.name'),
            price: '49',
            tagline: t('pricing.business.tagline'),
            features: [
                t('pricing.business.feature1'),
                t('pricing.business.feature2'),
                t('pricing.business.feature3'),
                t('pricing.business.feature4')
            ],
            cta: t('pricing.business.cta'),
            highlight: true
        },
        {
            id: 'enterprise',
            name: t('pricing.enterprise.name'),
            price: '149',
            tagline: t('pricing.enterprise.tagline'),
            features: [
                t('pricing.enterprise.feature1'),
                t('pricing.enterprise.feature2'),
                t('pricing.enterprise.feature3'),
                t('pricing.enterprise.feature4')
            ],
            cta: t('pricing.enterprise.cta'),
            highlight: false
        }
    ];

    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
            {/* Premium Nav */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-2xl py-4 border-b border-blue-500/20 shadow-2xl shadow-blue-500/10' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
                    <div className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">FB</div>
                        <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter">AUTOPOSTER <span className="text-amber-400 text-xs ml-1">PRO</span></div>
                    </div>
                    <div className="hidden md:flex gap-10 items-center">
                        <div className="scale-75"><LanguageSwitcher /></div>
                        <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t('auth.signIn')}</Link>
                        <Link href="/signup" className="metallic-button text-sm px-8 py-3 rounded-full">{t('auth.signUp')}</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-56 pb-32 px-6 relative aurora-bg min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-10 animate-pulse">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {t('landing.hero.status')}
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter">
                        {t('landing.hero.title1')} <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent italic drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">{t('landing.hero.title2')}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
                        {t('landing.hero.description')}
                    </p>
                    <Link href="/signup" className="metallic-button text-2xl px-16 py-6 rounded-[2rem] hover:scale-105 inline-block">{t('auth.enterDashboard')}</Link>
                </div>
            </section>

            {/* Plans Section */}
            <section className="py-40 bg-slate-950 px-6 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    {PLANS.map((plan, i) => (
                        <div key={i} className={`p-10 rounded-[3.5rem] glass-card border-blue-500/10 hover:border-blue-500/40 transition-all duration-700 group flex flex-col relative ${plan.highlight ? 'scale-105 border-blue-500/30' : ''}`}>
                            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter"><AntiCopy text={plan.name} /></h3>
                            <div className="flex items-end gap-2 px-2 mb-10">
                                <span className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">${plan.price}</span>
                                <span className="text-base mb-3 text-slate-500 font-black tracking-widest uppercase">/{t('pricing.monthly')}</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((f, j) => <li key={j} className="text-xs font-black uppercase tracking-tight text-slate-400">✓ <AntiCopy text={f} /></li>)}
                            </ul>
                            <Link href="/signup" className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-center ${plan.highlight ? 'bg-amber-400 text-slate-950' : 'bg-slate-800'}`}>
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Professional Footer */}
            <footer className="py-24 border-t border-white/5 bg-slate-950 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                        <div className="text-left">
                            <div className="text-xl font-black tracking-tighter mb-4">FB AUTOPOSTER <span className="text-blue-500">PRO</span></div>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest max-w-xs leading-relaxed">
                                {t('landing.hero.footerTag')}
                            </p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                        <p className="text-slate-500 text-[10px] leading-relaxed mb-8 opacity-50 hover:opacity-100 transition-opacity">
                            {t('common.disclaimer')}
                        </p>
                        <div className="text-center">
                            <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.5em]">{t('landing.hero.rights')}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

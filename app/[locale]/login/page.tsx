'use client';

import { SignIn } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../../context/LanguageContext';

export default function LoginPage() {
    const t = useTranslations();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 aurora-bg">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>

            {/* Language Switcher - Top Right */}
            <div className="fixed top-8 right-8 z-50">
                <LanguageSwitcher />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl mx-auto mb-6">FB</div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                        {t('auth.welcome')}
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">{t('dashboard.title')}</p>
                </div>

                <div className="glass-card p-2 rounded-[2.5rem] bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/5">
                    <SignIn
                        appearance={{
                            elements: {
                                card: "bg-transparent shadow-none border-none p-0",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "bg-slate-900 border border-white/5 hover:bg-slate-800 text-white rounded-2xl py-4",
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20",
                                formFieldInput: "bg-slate-950/50 border-white/5 text-white rounded-xl py-3 px-4",
                                footerActionLink: "text-blue-400 font-black",
                                formFieldLabel: "text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1"
                            }
                        }}
                        routing="hash"
                        signUpUrl="/signup"
                    />
                </div>

                <p className="mt-8 text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">
                    Quantum Encryption Enabled • v2025.1
                </p>
            </div>
        </div>
    );
}

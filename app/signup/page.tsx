'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { t } = useLanguage();

    async function handleSignup(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Important for cookies
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // ✅ SUCCESS! Token is set in cookie by the API
            // ✅ REDIRECT AUTOMATICALLY TO DASHBOARD
            router.push('/dashboard');
            router.refresh(); // Force refresh to pick up the cookie

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Handle ENTER key press
    function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && email && password) {
            e.preventDefault();
            handleSignup();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            {/* Language Switcher - Top Right */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            <div className="max-w-md w-full space-y-8 bg-slate-900/50 p-10 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        {t.createAccount}
                    </h1>
                    <p className="text-slate-400">{t.startAutomating}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                            {t.email}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="roberto@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                            {t.password}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {/* ENTER hint */}
                    <p className="text-center text-slate-600 text-xs">
                        💡 {t.pressEnter}
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? t.signingUp : t.signup}
                        {!loading && <span className="text-purple-300">⏎</span>}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-slate-500">{t.hasAccount} </span>
                    <Link href="/login" className="text-purple-400 font-bold hover:underline underline-offset-4">
                        {t.loginNow}
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
}

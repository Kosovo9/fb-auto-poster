'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Signup failed');
            }

            // Success! Go to login
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full space-y-8 bg-slate-900/50 p-10 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-2">CREAR CUENTA</h1>
                    <p className="text-slate-400">Comienza a automatizar hoy mismo</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="roberto@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-purple-500/20"
                    >
                        {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-slate-500">¿Ya tienes cuenta? </span>
                    <Link href="/login" className="text-purple-400 font-bold hover:underline underline-offset-4">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}

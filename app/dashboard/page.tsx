'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Analytics } from '../components/Analytics';
import { MediaUploader } from '../components/MediaUploader';
import { generateSpintaxVariations } from '../lib/spintax-generator';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Group {
    id: string;
    url: string;
    name: string;
    created_at: string;
}

interface Schedule {
    id: string;
    group_id: string;
    message: string;
    scheduled_time: string;
    status: string;
    groups?: Group;
    use_ai?: boolean;
    media_url?: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<{ id: string, email: string, plan: string } | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [groupUrl, setGroupUrl] = useState('');
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [message, setMessage] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [spintaxTemplate, setSpintaxTemplate] = useState('');

    const router = useRouter();
    const { t } = useLanguage();

    const fetchGroups = useCallback(async () => {
        try {
            const res = await fetch('/api/groups', { credentials: 'include' });
            if (res.status === 401) return router.push('/login');
            if (res.ok) {
                const data = await res.json();
                setGroups(data || []);
            }
        } catch (_err) {
            console.error('Error fetching groups');
        }
    }, [router]);

    const fetchSchedules = useCallback(async () => {
        try {
            const res = await fetch('/api/schedules', { credentials: 'include' });
            if (res.status === 401) return router.push('/login');
            if (res.ok) {
                const data = await res.json();
                setSchedules(data || []);
            }
        } catch (_err) {
            console.error('Error fetching schedules');
        }
    }, [router]);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (_err) {
            console.error('Error fetching user');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchUser(), fetchGroups(), fetchSchedules()]);
            setLoading(false);
        };
        init();

        const interval = setInterval(fetchSchedules, 30000);
        return () => clearInterval(interval);
    }, [fetchUser, fetchGroups, fetchSchedules]);

    const handleLogout = useCallback(() => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    }, [router]);

    const handleSubscription = useCallback(async (priceId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
                credentials: 'include',
            });
            const { sessionId } = await response.json();
            const stripe = await stripePromise;
            if (stripe) {
                await (stripe as any).redirectToCheckout({ sessionId });
            }
        } catch (err) {
            console.error('Stripe error:', err);
            setError(t.error);
        } finally {
            setLoading(false);
        }
    }, [t.error]);

    const addGroup = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: groupUrl, name: groupName }),
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to add group');

            setGroupUrl('');
            setGroupName('');
            setSuccess(`✅ ${t.success}`);
            fetchGroups();
        } catch (_err) {
            setError(`❌ ${t.error}`);
        } finally {
            setLoading(false);
        }
    }, [groupUrl, groupName, fetchGroups, t.error, t.success]);

    const schedulePost = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let finalMessage = message;
            if (spintaxTemplate && spintaxTemplate.includes('{')) {
                const variations = generateSpintaxVariations(spintaxTemplate, 1);
                finalMessage = variations[0];
            }

            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: selectedGroup,
                    message: finalMessage,
                    scheduled_time: new Date(scheduledTime).toISOString(),
                    use_ai: useAI,
                    media_url: mediaUrls[0] || ''
                }),
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to schedule post');

            setMessage('');
            setSpintaxTemplate('');
            setScheduledTime('');
            setSelectedGroup('');
            setMediaUrls([]);
            setSuccess(`📅 ${t.success}`);
            fetchSchedules();
        } catch (_err) {
            setError(`❌ ${t.error}`);
        } finally {
            setLoading(false);
        }
    }, [message, spintaxTemplate, selectedGroup, scheduledTime, useAI, mediaUrls, fetchSchedules, t.error, t.success]);

    const stats = useMemo(() => {
        const posted = schedules.filter(s => s.status === 'posted').length;
        const pending = schedules.filter(s => s.status === 'pending').length;
        return { posted, pending };
    }, [schedules]);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">{t.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen py-8 px-4 text-slate-200 bg-slate-950">
            <div className="max-w-7xl mx-auto">

                {/* Header Premium */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">v2.0 PRO</span>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                                FB AUTO-POSTER
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">Automatización IA • Spintax • Analytics • Monetización</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={() => handleSubscription('price_premium')}
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
                        >
                            {t.upgradePro}
                        </button>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">{t.logout}</button>
                    </div>
                </div>

                {/* Aggressive Upsell Banner */}
                {user?.plan !== 'enterprise' && (
                    <div className="mb-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1 rounded-3xl shadow-2xl shadow-blue-500/20">
                        <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[1.4rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-white">{t.nuclearMode}</h3>
                                <p className="text-slate-400 text-sm font-medium">Automatización de WhatsApp y extracción de leads con IA disponible en ENTERPRISE.</p>
                            </div>
                            <button
                                onClick={() => handleSubscription('price_enterprise')}
                                className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap"
                            >
                                {t.upgradeEnterprise}
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-200 backdrop-blur-md animate-shake">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-2xl text-green-200 backdrop-blur-md animate-fade-in">{success}</div>}

                {/* Real-time Analytics Component */}
                <Analytics />

                {/* ROI & Conversion Estimator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">💰</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t.roiEstimator}</h3>
                        <p className="text-3xl font-black text-white">$1,450.00</p>
                        <p className="text-[10px] text-green-400 font-bold mt-1">Basado en conversiones IA</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">⚡</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t.groupCapacity}</h3>
                        <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden mb-2">
                            <div className="bg-blue-500 h-full w-[70%]" />
                        </div>
                        <p className="text-xs font-bold text-slate-300">{groups.length}/10 {t.groupsManagement}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">📈</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t.conversionRate}</h3>
                        <p className="text-3xl font-black text-white">12.4%</p>
                        <p className="text-[10px] text-purple-400 font-bold mt-1">+2.1% esta semana</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Panel Izquierdo: Gestión de Grupos */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-lg shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="p-2 bg-blue-500/20 rounded-xl text-blue-400">📍</span>
                                {t.groupsManagement}
                            </h2>
                            <form onSubmit={addGroup} className="space-y-4 mb-8">
                                <input
                                    type="text"
                                    placeholder={t.groupName}
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                                <input
                                    type="url"
                                    placeholder={t.groupUrl}
                                    value={groupUrl}
                                    onChange={(e) => setGroupUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                                    required
                                />
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                                    {loading ? t.adding : t.addGroup}
                                </button>
                            </form>

                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {groups.map(g => (
                                    <div key={g.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all group">
                                        <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{g.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{g.url}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Panel Central: Programador */}
                    <div className="lg:col-span-8">
                        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-lg shadow-2xl h-full">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <span className="p-2 bg-purple-500/20 rounded-xl text-purple-400">⏰</span>
                                {t.schedulePost}
                            </h2>

                            <form onSubmit={schedulePost} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{t.selectGroup}</label>
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">{t.selectGroup}</option>
                                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{t.dateTime}</label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex justify-between">
                                            <span>{t.spintaxContent}</span>
                                            <span className="text-[10px] text-blue-400 lowercase font-normal italic">Tip: use {"{opt1|opt2}"}</span>
                                        </label>
                                        <textarea
                                            placeholder="{Hola|Saludos|Qué tal} amigos de este gran grupo..."
                                            value={spintaxTemplate}
                                            onChange={(e) => {
                                                setSpintaxTemplate(e.target.value);
                                                if (!message) setMessage(e.target.value);
                                            }}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white h-24 resize-none transition-all focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{t.previewMessage}</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-400 h-24 italic"
                                            placeholder="Preview..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 px-1">{t.mediaUpload}</label>
                                    <MediaUploader onUpload={(url) => setMediaUrls([...mediaUrls, url])} />
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 group cursor-pointer" onClick={() => setUseAI(!useAI)}>
                                        <input type="checkbox" checked={useAI} readOnly className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 transition-all" />
                                        <span className="text-sm font-bold text-blue-300">{t.useAI}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center gap-3"
                                    >
                                        {loading ? t.scheduling : t.scheduleNow}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>

                {/* Operations Log */}
                <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-lg shadow-2xl mb-12">
                    <h2 className="text-2xl font-bold mb-8">{t.operationsLog}</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-950 text-slate-500 uppercase text-[10px] tracking-widest">
                                    <th className="text-left p-6">{t.group}</th>
                                    <th className="text-left p-6">{t.message}</th>
                                    <th className="text-center p-6">{t.scheduledDate}</th>
                                    <th className="text-center p-6">{t.statusTerm}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-600 font-bold tracking-widest uppercase text-xs">No hay posteos programados</td>
                                    </tr>
                                ) : schedules.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-6 font-bold text-blue-400">{s.groups?.name || '---'}</td>
                                        <td className="p-6 text-slate-300 max-w-sm"><div className="truncate">{s.message}</div></td>
                                        <td className="p-6 text-center text-slate-500 text-xs">{new Date(s.scheduled_time).toLocaleString()}</td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${s.status === 'posted' ? 'bg-green-500/20 text-green-400' :
                                                    s.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CRM & Referrals Section */}
                {(user?.plan === 'business' || user?.plan === 'enterprise' || !user) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Leads Extraction */}
                        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase tracking-tighter">{t.leadsExtraction}</h2>
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Enterprise</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white uppercase text-sm">Neil Ortega</p>
                                        <p className="text-blue-400 font-mono text-xs">+52 55 1234 5678</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] bg-green-500/20 text-green-400 font-black px-2 py-1 rounded-md uppercase">Comprar</span>
                                    </div>
                                </div>
                                <p className="text-center text-slate-600 text-[10px] py-4 font-black uppercase tracking-widest">Conecta tu cuenta para ver leads reales</p>
                            </div>
                        </section>

                        {/* Referral System */}
                        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase tracking-tighter">{t.referralProgram}</h2>
                                <span className="text-green-400 font-black text-xs">{t.earnCommission}</span>
                            </div>
                            <div className="bg-black p-6 rounded-2xl border border-slate-800 mb-6">
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">{t.yourLink}</p>
                                <code className="text-xs text-blue-400 break-all bg-blue-500/5 p-2 rounded-lg block font-mono">
                                    fb-autoposter.pro/signup?ref={user?.id.slice(0, 8) || 'USER'}
                                </code>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-600 text-[10px] font-black mb-1 uppercase tracking-widest">Referidos</p>
                                    <p className="text-2xl font-black">0</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-600 text-[10px] font-black mb-1 uppercase tracking-widest">Total Ganado</p>
                                    <p className="text-2xl font-black text-green-400 font-mono mt-1">$0.00</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </main>
    );
}

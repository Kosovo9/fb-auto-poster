'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Analytics } from '../components/Analytics';
import { MediaUploader } from '../components/MediaUploader';
import { generateSpintaxVariations } from '../lib/spintax-generator';
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

    useEffect(() => {
        // Simple check for auth - in a real app would use a context or useSWR
        const init = async () => {
            try {
                // We don't have a /api/auth/me yet, but we can assume success if middleware passed
                // For now, let's just fetch groups/schedules and handle 401
                await Promise.all([fetchGroups(), fetchSchedules()]);
            } catch (err) {
                console.error("Init error", err);
            } finally {
                setLoading(false);
            }
        };
        init();
        const interval = setInterval(() => {
            fetchSchedules();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchGroups() {
        try {
            const res = await fetch('/api/groups');
            if (res.status === 401) return router.push('/login');
            if (res.ok) {
                const data = await res.json();
                setGroups(data || []);
            }
        } catch (_err) {
            setError('Error fetching groups');
        }
    }

    async function fetchSchedules() {
        try {
            const res = await fetch('/api/schedules');
            if (res.status === 401) return router.push('/login');
            if (res.ok) {
                const data = await res.json();
                setSchedules(data || []);
            }
        } catch (_err) {
            setError('Error fetching schedules');
        }
    }

    async function handleLogout() {
        // Clear cookie would be best done via API
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    }

    async function handleSubscription(priceId: string) {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }), // userId removed, handled by webhook/bridge
            });
            const { sessionId } = await response.json();
            const stripe = await stripePromise;
            if (stripe) {
                await (stripe as any).redirectToCheckout({ sessionId });
            }
        } catch (err) {
            console.error('Stripe error:', err);
            setError('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    }

    async function addGroup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: groupUrl, name: groupName }),
            });

            if (!res.ok) throw new Error('Failed to add group');

            setGroupUrl('');
            setGroupName('');
            setSuccess('✅ Grupo agregado exitosamente');
            fetchGroups();
        } catch (_err) {
            setError('❌ Error al agregar grupo');
        } finally {
            setLoading(false);
        }
    }

    async function schedulePost(e: React.FormEvent) {
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
            });

            if (!res.ok) throw new Error('Failed to schedule post');

            setMessage('');
            setSpintaxTemplate('');
            setScheduledTime('');
            setSelectedGroup('');
            setMediaUrls([]);
            setSuccess('📅 Posteo programado exitosamente');
            fetchSchedules();
        } catch (_err) {
            setError('❌ Error al programar posteo');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen py-8 px-4 text-slate-200">
            <div className="max-w-7xl mx-auto">

                {/* Header Premium */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">v2.0 PRO</span>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                FB AUTO-POSTER
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">Automatización IA • Spintax • Analytics • Monetización</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSubscription('price_premium')}
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
                        >
                            👑 OBTENER PRO
                        </button>
                    </div>
                </div>

                {/* Aggressive Upsell Banner */}
                {user?.plan !== 'enterprise' && (
                    <div className="mb-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1 rounded-3xl shadow-2xl shadow-blue-500/20 animate-pulse">
                        <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[1.4rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-1">🚀 ¡DESBLOQUEA EL MODO NUCLEAR!</h3>
                                <p className="text-slate-400 text-sm font-medium">Automatización de WhatsApp y extracción de leads con IA disponible en ENTERPRISE.</p>
                            </div>
                            <button
                                onClick={() => handleSubscription('price_enterprise')}
                                className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap"
                            >
                                ACTUALIZAR AHORA
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-200 backdrop-blur-md animate-shake">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-2xl text-green-200 backdrop-blur-md animate-fade-in">{success}</div>}

                {/* Real-time Analytics Component */}
                <Analytics />

                {/* ROI & Conversion Estimator (Power Features) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">💰</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">ROI Estimado</h3>
                        <p className="text-3xl font-black text-white">$1,450.00</p>
                        <p className="text-[10px] text-green-400 font-bold mt-1">Basado en conversiones IA</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">⚡</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Capacidad de Grupos</h3>
                        <div className="w-full bg-slate-900 rounded-full h-2 mt-4 overflow-hidden mb-2">
                            <div className="bg-blue-500 h-full w-[70%]" />
                        </div>
                        <p className="text-xs font-bold text-slate-300">7/10 Grupos utilizados</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">📈</div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Tasa de Conversión</h3>
                        <p className="text-3xl font-black text-white">12.4%</p>
                        <p className="text-[10px] text-purple-400 font-bold mt-1">+2.1% esta semana</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Panel Izquierdo: Configuración */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Agregar Grupos */}
                        <section className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-lg shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="p-2 bg-blue-500/20 rounded-xl text-blue-400">📍</span>
                                Gestión de Grupos
                            </h2>
                            <form onSubmit={addGroup} className="space-y-4 mb-8">
                                <input
                                    type="text"
                                    placeholder="Nombre del Grupo"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                                <input
                                    type="url"
                                    placeholder="URL del Grupo"
                                    value={groupUrl}
                                    onChange={(e) => setGroupUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                                    required
                                />
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                                    {loading ? '...' : '＋ Agregar Grupo'}
                                </button>
                            </form>

                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {groups.map(g => (
                                    <div key={g.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-500 transition-all group">
                                        <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{g.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{g.url}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Panel Central: Programador */}
                    <div className="lg:col-span-8">
                        <section className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-lg shadow-2xl h-full">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <span className="p-2 bg-purple-500/20 rounded-xl text-purple-400">⏰</span>
                                Programador Maestro
                            </h2>

                            <form onSubmit={schedulePost} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Grupo Destino</label>
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Selecciona un grupo</option>
                                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex justify-between">
                                            <span>Contenido Spintax</span>
                                            <span className="text-[10px] text-blue-400 lowercase font-normal italic">Tip: use {"{opt1|opt2}"}</span>
                                        </label>
                                        <textarea
                                            placeholder="{Hola|Saludos|Qué tal} amigos de este gran grupo..."
                                            value={spintaxTemplate}
                                            onChange={(e) => {
                                                setSpintaxTemplate(e.target.value);
                                                if (!message) setMessage(e.target.value);
                                            }}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white h-24 resize-none transition-all focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Preview del Mensaje</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl text-slate-400 h-24 italic"
                                            placeholder="El mensaje final que verán los usuarios..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Media (Fotos/Videos)</label>
                                    <MediaUploader onUpload={(url) => setMediaUrls([...mediaUrls, url])} />
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 group cursor-pointer" onClick={() => setUseAI(!useAI)}>
                                        <input type="checkbox" checked={useAI} readOnly className="w-5 h-5 rounded-lg border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 transition-all" />
                                        <span className="text-sm font-bold text-blue-300">✨ Responder con IA (v2.0)</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center gap-3"
                                    >
                                        {loading ? 'PROGRAMANDO...' : '🚀 AGENDAR AHORA'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>

                {/* Schedules Log */}
                <section className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-lg shadow-2xl">
                    <h2 className="text-2xl font-bold mb-8">📊 Registro de Operaciones</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-widest">
                                    <th className="text-left p-6">Grupo</th>
                                    <th className="text-left p-6">Mensaje</th>
                                    <th className="text-center p-6">Fecha Programada</th>
                                    <th className="text-center p-6">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {schedules.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-6 font-bold text-blue-400">{s.groups?.name}</td>
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
                    {/* CRM & Referrals Section - Only for Power Users */}
                    {(user?.plan === 'business' || user?.plan === 'enterprise') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Leads Extraction */}
                            <section className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black uppercase tracking-tighter">💎 Leads Extraídos (IA)</h2>
                                    <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Enterprise</span>
                                </div>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {/* Placeholder or Fetch from /api/leads */}
                                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white uppercase text-sm">Neil Ortega</p>
                                            <p className="text-blue-400 font-mono text-xs">+52 55 1234 5678</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] bg-green-500/20 text-green-400 font-black px-2 py-1 rounded-md uppercase">Comprar</span>
                                        </div>
                                    </div>
                                    <p className="text-center text-slate-500 text-xs py-4 font-bold uppercase tracking-widest">Conecta tu cuenta para ver leads reales</p>
                                </div>
                            </section>

                            {/* Referral System */}
                            <section className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black uppercase tracking-tighter">💸 Programa de Referidos</h2>
                                    <span className="text-green-400 font-black text-xs">Gana 25%</span>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 mb-6">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Tu link único:</p>
                                    <code className="text-xs text-blue-400 break-all bg-blue-500/5 p-2 rounded-lg block">fb-autoposter.pro/signup?ref=ROB123</code>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 text-[10px] font-black mb-1">REFERIDOS</p>
                                        <p className="text-2xl font-black">12</p>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 text-[10px] font-black mb-1">TOTAL GANADO</p>
                                        <p className="text-2xl font-black text-green-400 font-mono text-xs mt-2">$345.00</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                </section>
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
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </main>
    );
}

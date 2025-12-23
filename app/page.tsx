'use client';

import { useEffect, useState } from 'react';

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
    const [groups, setGroups] = useState<Group[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [groupUrl, setGroupUrl] = useState('');
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [message, setMessage] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [mediaUrls, setMediaUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [analytics, setAnalytics] = useState({ total_posts: 0, success_rate: 0, pending: 0 });

    useEffect(() => {
        fetchGroups();
        fetchSchedules();
        fetchAnalytics();
        const interval = setInterval(() => {
            fetchSchedules();
            fetchAnalytics();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchAnalytics() {
        try {
            const res = await fetch('/api/analytics');
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (e) {
            console.error('Error fetching analytics');
        }
    }

    async function handleUpgrade() {
        try {
            setLoading(true);
            const res = await fetch('/api/checkout', { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            setError('Error initiating checkout');
        } finally {
            setLoading(false);
        }
    }

    async function fetchGroups() {
        try {
            const res = await fetch('/api/groups');
            if (!res.ok) throw new Error('Failed to fetch groups');
            const data = await res.json();
            setGroups(data || []);
        } catch (err) {
            setError('Error fetching groups');
        }
    }

    async function fetchSchedules() {
        try {
            const res = await fetch('/api/schedules');
            if (!res.ok) throw new Error('Failed to fetch schedules');
            const data = await res.json();
            setSchedules(data || []);
        } catch (err) {
            setError('Error fetching schedules');
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
        } catch (err) {
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
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: selectedGroup,
                    message,
                    scheduled_time: new Date(scheduledTime).toISOString(),
                    use_ai: useAI,
                    media_url: mediaUrls,
                }),
            });

            if (!res.ok) throw new Error('Failed to schedule post');

            setMessage('');
            setScheduledTime('');
            setSelectedGroup('');
            setSuccess('📅 Posteo programado exitosamente');
            fetchSchedules();
        } catch (err) {
            setError('❌ Error al programar posteo');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        🚀 Facebook Auto-Poster
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Automatiza posteos en múltiples grupos de Facebook sin esfuerzo
                    </p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-200">
                        {success}
                    </div>
                )}

                {/* Sección 0: Analytics & Premium */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Total Posteos</h3>
                        <p className="text-4xl font-bold text-white mt-2">{analytics.total_posts}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Tasa de Éxito</h3>
                        <p className="text-4xl font-bold text-green-400 mt-2">{analytics.success_rate}%</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Pendientes</h3>
                        <p className="text-4xl font-bold text-yellow-400 mt-2">{analytics.pending}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-lg border border-purple-500 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-purple-200 text-sm font-bold uppercase">Versión PRO</h3>
                        <p className="text-lg text-white mt-2 mb-3">IA + Analytics Avanzado</p>
                        <button
                            onClick={handleUpgrade}
                            className="bg-white text-purple-900 font-bold py-2 px-4 rounded-full text-sm hover:scale-105 transition-transform"
                        >
                            🚀 Mejorar Plan ($19)
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                    {/* Sección 1: Agregar Grupos */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            📍 Agregar Grupos
                        </h2>

                        <form onSubmit={addGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre del Grupo</label>
                                <input
                                    type="text"
                                    placeholder="ej: Venta de Autos MX"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">URL del Grupo</label>
                                <input
                                    type="url"
                                    placeholder="facebook.com/groups/123456789"
                                    value={groupUrl}
                                    onChange={(e) => setGroupUrl(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-6 py-3 rounded-lg font-bold transition-colors"
                            >
                                {loading ? '⏳ Agregando...' : '✅ Agregar Grupo'}
                            </button>
                        </form>

                        {/* Grupos Guardados */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-4">Grupos Guardados ({groups.length})</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {groups.length > 0 ? (
                                    groups.map((g) => (
                                        <div key={g.id} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                                            <p className="font-bold text-blue-300">{g.name}</p>
                                            <p className="text-sm text-slate-400 truncate">{g.url}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400">No hay grupos agregados aún</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Programar Posteos */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            ⏰ Programar Posteo
                        </h2>

                        <form onSubmit={schedulePost} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Selecciona Grupo</label>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="">-- Selecciona un grupo --</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tu Mensaje</label>
                                <textarea
                                    placeholder="Escribe tu mensaje aquí..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-32 resize-none"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Soporta Spintax: {"{Hola|Saludos} {amigo|colega}"}</p>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                <input
                                    type="checkbox"
                                    id="useAI"
                                    checked={useAI}
                                    onChange={(e) => setUseAI(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-500 text-blue-600 focus:ring-blue-500 bg-slate-700"
                                />
                                <label htmlFor="useAI" className="text-sm font-medium cursor-pointer">
                                    ✨ Activar Respuesta con IA (Gemini)
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Media URL (Opcional)</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={mediaUrls}
                                    onChange={(e) => setMediaUrls(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-6 py-3 rounded-lg font-bold transition-colors"
                            >
                                {loading ? '⏳ Programando...' : '📅 Programar Posteo'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sección 3: Historial de Posteos */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        📊 Posteos Programados ({schedules.length})
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-3 font-bold text-slate-300">Grupo</th>
                                    <th className="text-left p-3 font-bold text-slate-300">Mensaje</th>
                                    <th className="text-left p-3 font-bold text-slate-300">Hora</th>
                                    <th className="text-left p-3 font-bold text-slate-300">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.length > 0 ? (
                                    schedules.map((s) => (
                                        <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                            <td className="p-3">{s.groups?.name || 'N/A'}</td>
                                            <td className="p-3 truncate max-w-xs text-slate-400">{s.message}</td>
                                            <td className="p-3 text-sm text-slate-400">
                                                {new Date(s.scheduled_time).toLocaleString('es-MX')}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-3 py-1 rounded text-xs font-bold ${s.status === 'posted'
                                                        ? 'bg-green-900 text-green-200'
                                                        : s.status === 'failed'
                                                            ? 'bg-red-900 text-red-200'
                                                            : 'bg-yellow-900 text-yellow-200'
                                                        }`}
                                                >
                                                    {s.status === 'posted'
                                                        ? '✅ Posted'
                                                        : s.status === 'failed'
                                                            ? '❌ Failed'
                                                            : '⏳ Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-3 text-center text-slate-400">
                                            No hay posteos programados aún
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

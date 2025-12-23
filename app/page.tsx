'use client';

import { useEffect, useState } from 'react';
import { Analytics } from './components/Analytics';
import { MediaUploader } from './components/MediaUploader';
import { generateSpintaxVariations } from './lib/spintax-generator';

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
    const [spintaxTemplate, setSpintaxTemplate] = useState('');

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

    // Updated schedulePost to handle Spintax
    async function schedulePost(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let finalMessage = message;
            if (spintaxTemplate && spintaxTemplate.includes('{')) {
                const variations = generateSpintaxVariations(spintaxTemplate, 5);
                finalMessage = variations[0]; // Use first variation
                // Ideally submit all variations for different groups if multiple groups selected
            }

            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: selectedGroup,
                    message: finalMessage,
                    scheduled_time: new Date(scheduledTime).toISOString(),
                    use_ai: useAI,
                    media_url: mediaUrls, // Sending single URL string for compatibility with DB schema v2, but could be array in v3 logic
                }),
            });

            if (!res.ok) throw new Error('Failed to schedule post');

            setMessage('');
            setSpintaxTemplate('');
            setScheduledTime('');
            setSelectedGroup('');
            setMediaUrls('');
            setSuccess('📅 Posteo programado exitosamente');
            fetchSchedules();
        } catch (err) {
            setError('❌ Error al programar posteo');
        } finally {
            setLoading(false);
        }
    }

    // ... (render)

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        🚀 Facebook Auto-Poster PRO
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Automatiza, Varía y Monetiza 10x
                    </p>
                </div>

                {/* Status Messages */}
                {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-200">{success}</div>}

                {/* Analytics Section */}
                <Analytics />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Add Group Section (Unchanged) */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📍 Agregar Grupos</h2>
                        <form onSubmit={addGroup} className="space-y-4">
                            {/* ...inputs... */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre del Grupo</label>
                                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">URL del Grupo</label>
                                <input type="url" value={groupUrl} onChange={(e) => setGroupUrl(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold">{loading ? '⏳...' : '✅ Agregar'}</button>
                        </form>
                        {/* List */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-4">Grupos ({groups.length})</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {groups.map(g => (
                                    <div key={g.id} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                                        <p className="font-bold text-blue-300">{g.name}</p>
                                        <p className="text-sm text-slate-400 truncate">{g.url}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">⏰ Programar Posteo</h2>
                        <form onSubmit={schedulePost} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Grupo</label>
                                <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required>
                                    <option value="">-- Selecciona --</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>

                            {/* Spintax Tab */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Usar Spintax (Auto-Variación) 🎲</label>
                                <textarea
                                    placeholder="Ej: {Hola|Qué tal} {amigos|grupo}..."
                                    value={spintaxTemplate}
                                    onChange={(e) => {
                                        setSpintaxTemplate(e.target.value);
                                        // Auto-fill message for preview
                                        setMessage(e.target.value);
                                    }}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs h-20 resize-none mb-2"
                                />
                                <label className="block text-sm font-medium mb-2">Mensaje Final (Vista Previa)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-24"
                                    required
                                />
                            </div>

                            {/* Media Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">📸 Fotos/Videos</label>
                                <MediaUploader onUpload={(url) => setMediaUrls(url)} />
                            </div>

                            <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                <input type="checkbox" id="useAI" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} className="w-5 h-5 rounded" />
                                <label htmlFor="useAI" className="text-sm font-medium cursor-pointer">✨ Responder Comentarios con IA</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha</label>
                                <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required />
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold">{loading ? '⏳...' : '📅 Programar'}</button>
                        </form>
                    </div>
                </div>

                {/* Schedules Table (Existing) */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6">📊 Posteos Programados</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-3 text-slate-300">Grupo</th>
                                    <th className="text-left p-3 text-slate-300">Mensaje</th>
                                    <th className="text-left p-3 text-slate-300">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map(s => (
                                    <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                        <td className="p-3">{s.groups?.name}</td>
                                        <td className="p-3 truncate max-w-xs">{s.message}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${s.status === 'posted' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

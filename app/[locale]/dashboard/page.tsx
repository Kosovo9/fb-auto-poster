'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Analytics } from '../../components/Analytics';
import { MediaUploader } from '../../components/MediaUploader';
import { generateSpintaxVariations } from '../../lib/spintax-generator';
import { LanguageSwitcher } from '../../context/LanguageContext';
import { useTranslations } from 'next-intl';

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
    const { user, isLoaded } = useUser();
    const t = useTranslations();

    // States
    const [groups, setGroups] = useState<Group[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [groupUrl, setGroupUrl] = useState('');
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [message, setMessage] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [spintaxTemplate, setSpintaxTemplate] = useState('');

    const fetchGroups = useCallback(async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const data = await res.json();
                setGroups(data || []);
            }
        } catch (_err) { }
    }, []);

    const fetchSchedules = useCallback(async () => {
        try {
            const res = await fetch('/api/schedules');
            if (res.ok) {
                const data = await res.json();
                setSchedules(data || []);
            }
        } catch (_err) { }
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            fetchGroups();
            fetchSchedules();
        }
    }, [isLoaded, user, fetchGroups, fetchSchedules]);

    const handlePayment = useCallback(async (provider: 'paypal' | 'mercadopago', plan: string) => {
        setLoading(true);
        try {
            const endpoint = `/api/payments/${provider}`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, userId: user?.id }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [user?.id, t]);

    const addGroup = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: groupUrl, name: groupName }),
            });
            if (!res.ok) throw new Error();
            setGroupUrl('');
            setGroupName('');
            setSuccess(t('common.success'));
            fetchGroups();
        } catch (_err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [groupUrl, groupName, fetchGroups, t]);

    const schedulePost = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
            if (!res.ok) throw new Error();
            setMessage('');
            setSpintaxTemplate('');
            setScheduledTime('');
            setSuccess(t('common.success'));
            fetchSchedules();
        } catch (_err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [message, spintaxTemplate, selectedGroup, scheduledTime, useAI, mediaUrls, fetchSchedules, t]);

    if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

    return (
        <main className="min-h-screen py-8 px-6 text-slate-200 bg-slate-950 aurora-bg bg-fixed relative">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 glass-card p-8 rounded-[2.5rem] border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl">FB</div>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">QUANTUM 2025</span>
                                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent uppercase tracking-tighter">{t('dashboard.title')}</h1>
                            </div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('dashboard.welcome', { name: user?.firstName || 'User' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <LanguageSwitcher />
                        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-12"><Analytics /></div>

                    <div className="lg:col-span-8">
                        <section className="glass-card p-10 rounded-[3rem] border-white/5 h-full">
                            <h2 className="text-2xl font-black mb-10 uppercase tracking-tighter">⏰ {t('dashboard.schedulePost')}</h2>
                            <form onSubmit={schedulePost} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <select
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-950/60 border border-white/10 rounded-2xl text-white font-bold"
                                        required
                                    >
                                        <option value="">{t('dashboard.selectGroup')}...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                    <input
                                        type="datetime-local"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-950/60 border border-white/10 rounded-2xl text-white font-bold"
                                        required
                                    />
                                </div>
                                <textarea
                                    placeholder={t('dashboard.spintaxContent')}
                                    value={spintaxTemplate}
                                    onChange={(e) => setSpintaxTemplate(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-950/60 border border-white/10 rounded-3xl text-white h-32"
                                />
                                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                    <button onClick={() => setUseAI(!useAI)} type="button" className={`px-6 py-3 rounded-2xl border font-black text-xs transition-all ${useAI ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                        {t('dashboard.useAI')}
                                    </button>
                                    <button type="submit" disabled={loading} className="metallic-button text-xl px-20 py-5 rounded-[2rem]">
                                        {loading ? t('common.loading') : t('dashboard.scheduleNow')}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        <section className="glass-card p-8 rounded-[3rem] border-white/5">
                            <h2 className="text-xl font-black mb-8 uppercase tracking-tighter">🗺️ {t('dashboard.groupsManagement')}</h2>
                            <form onSubmit={addGroup} className="space-y-4">
                                <input placeholder={t('dashboard.groupName')} value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl text-xs font-bold" required />
                                <input placeholder={t('dashboard.groupUrl')} value={groupUrl} onChange={(e) => setGroupUrl(e.target.value)} className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-2xl text-[10px] font-mono" required type="url" />
                                <button type="submit" className="w-full bg-blue-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest">{t('dashboard.addGroup')}</button>
                            </form>
                        </section>
                        <div className="glass-card p-10 rounded-[3rem] border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.roiEstimator')}</p>
                            <p className="text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">$2,450.00</p>
                            <p className="text-[9px] text-slate-700 font-bold mt-4 uppercase tracking-[0.2em]">{t('dashboard.nuclearMode')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="mt-20 py-10 text-center border-t border-white/5">
                <p className="text-slate-500 text-[10px] leading-relaxed mb-4 max-w-4xl mx-auto px-6 opacity-30 hover:opacity-100 transition-opacity">
                    {t('common.disclaimer')}
                </p>
                <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.5em]">Antigravity Nuclear Mode • Quantum v1.0</p>
            </footer>
        </main>
    );
}

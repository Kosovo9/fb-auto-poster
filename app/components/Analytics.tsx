'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
    totalPostsPublished: number;
    totalCommentsReceived: number;
    totalConversions: number;
    estimatedRevenue: number;
    engagementRate: number;
}

export function Analytics({ userId }: { userId?: string }) {
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                // Fetch without params, let middleware handle identity
                const res = await fetch(`/api/analytics`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // Actualizar cada 30 seg
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-slate-400">Cargando analytics...</div>;
    if (!stats) return <div className="text-red-400">Error cargando datos</div>;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Posteos</p>
                <p className="text-2xl font-bold text-white">{stats.totalPostsPublished}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Comentarios</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalCommentsReceived}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Conversiones</p>
                <p className="text-2xl font-bold text-green-400">
                    {stats.totalConversions}
                </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Ingresos Est.</p>
                <p className="text-2xl font-bold text-green-400 font-mono">
                    ${(stats.estimatedRevenue / 1000000).toFixed(2)}M
                </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Engagement</p>
                <p className="text-2xl font-bold text-purple-400">{stats.engagementRate.toFixed(1)}%</p>
            </div>
        </div>
    );
}

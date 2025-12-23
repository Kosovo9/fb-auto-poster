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
                const url = userId ? `/api/analytics?userId=${userId}` : '/api/analytics';
                const res = await fetch(url);
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
        const interval = setInterval(fetchAnalytics, 30000); // 30s update
        return () => clearInterval(interval);
    }, [userId]);

    if (loading) return <div className="text-slate-400 p-4">Cargando analytics...</div>;
    if (!stats) return <div className="text-red-400 p-4">Error cargando datos o sin datos.</div>;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold">Posteos</p>
                <p className="text-2xl font-bold text-white">{stats.totalPostsPublished}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold">Comentarios</p>
                <p className="text-2xl font-bold text-white">{stats.totalCommentsReceived}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold">Conversiones</p>
                <p className="text-2xl font-bold text-green-400">
                    {stats.totalConversions}
                </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold">Ingresos Est.</p>
                <p className="text-2xl font-bold text-green-400">
                    ${(stats.estimatedRevenue / 1000).toFixed(1)}k
                </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold">Engagement</p>
                <p className="text-2xl font-bold text-blue-400">{stats.engagementRate.toFixed(1)}%</p>
            </div>
        </div>
    );
}

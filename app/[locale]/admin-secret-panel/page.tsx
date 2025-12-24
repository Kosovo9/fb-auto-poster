'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../../context/LanguageContext';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AdminStats {
    totalUsers: number;
    totalRevenue: number;
    activeSubscriptions: number;
    todaySignups: number;
    recentActivity: ActivityItem[];
}

interface ActivityItem {
    id: string;
    type: 'signup' | 'payment' | 'post' | 'error';
    message: string;
    timestamp: string;
    user?: string;
}

export default function AdminSecretDashboard() {
    const { user, isLoaded } = useUser();
    const t = useTranslations();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 1247,
        totalRevenue: 45890,
        activeSubscriptions: 892,
        todaySignups: 34,
        recentActivity: [
            { id: '1', type: 'payment', message: 'Payment: $99 (Business)', timestamp: '2 min ago', user: 'maria@test.com' },
            { id: '2', type: 'signup', message: 'New signup', timestamp: '5 min ago', user: 'carlos@test.com' },
        ],
    });

    useEffect(() => {
        if (isLoaded && !user) router.push('/login');
        // Simple role check (could be refined with Clerk roles)
        if (isLoaded && user && user.publicMetadata.role !== 'admin' && !user.emailAddresses[0].emailAddress.includes('admin')) {
            router.push('/dashboard');
        }
    }, [isLoaded, user, router]);

    if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white aurora-bg bg-fixed">
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-red-900/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">🔒 ADMIN</span>
                        <h1 className="text-xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter">
                            {t('dashboard.title')} [ADMIN]
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">← User View</Link>
                        <SignOutButton><button className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30">LOGOUT</button></SignOutButton>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-900/60 border border-red-500/10 rounded-2xl p-6">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Users</p>
                        <p className="text-3xl font-black">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-green-500/10 rounded-2xl p-6">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Revenue</p>
                        <p className="text-3xl font-black">${stats.totalRevenue}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

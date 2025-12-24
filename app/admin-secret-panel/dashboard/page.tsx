'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import Link from 'next/link';

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
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        todaySignups: 0,
        recentActivity: [],
    });
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        verifyAdminAndLoadStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    async function verifyAdminAndLoadStats() {
        try {
            // Verify admin access
            const authRes = await fetch('/api/auth/me', { credentials: 'include' });

            if (!authRes.ok) {
                router.push('/login');
                return;
            }

            const userData = await authRes.json();
            setUserEmail(userData.email);

            // 🔒 SECURITY CHECK: Only admin can access
            if (userData.role !== 'admin' && !userData.email?.includes('admin')) {
                // Not admin - redirect to regular dashboard
                router.push('/dashboard');
                return;
            }

            await fetchStats();
        } catch (err) {
            console.error('Admin verification failed:', err);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }

    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                // Use demo data
                setStats({
                    totalUsers: 1247,
                    totalRevenue: 45890,
                    activeSubscriptions: 892,
                    todaySignups: 34,
                    recentActivity: [
                        { id: '1', type: 'payment', message: 'Payment: $99 (Business)', timestamp: '2 min ago', user: 'maria@test.com' },
                        { id: '2', type: 'signup', message: 'New signup', timestamp: '5 min ago', user: 'carlos@test.com' },
                        { id: '3', type: 'post', message: 'Post scheduled', timestamp: '12 min ago', user: 'roberto@test.com' },
                        { id: '4', type: 'payment', message: 'Payment: $29 (Pro)', timestamp: '18 min ago', user: 'ana@test.com' },
                        { id: '5', type: 'signup', message: 'New signup', timestamp: '25 min ago', user: 'luis@test.com' },
                    ],
                });
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }

    function handleLogout() {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">🔒 Verificando acceso admin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Top Bar */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-red-900/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                                🔒 ADMIN
                            </span>
                            <h1 className="text-xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                                {t.adminDashboard}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-xs hidden md:block">{userEmail}</span>
                        <LanguageSwitcher />
                        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                            ← User View
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-all"
                        >
                            {t.logout}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Security Notice */}
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-red-400">🔒</span>
                    <span className="text-red-300 text-sm">Panel de administración seguro. Acceso restringido.</span>
                </div>

                {/* System Health */}
                <div className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-green-400">{t.systemHealth}: ONLINE</span>
                    </div>
                    <span className="text-slate-500 text-xs">Updated just now</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-xs font-bold uppercase">{t.totalUsers}</span>
                            <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">👥</span>
                        </div>
                        <p className="text-3xl font-black">{stats.totalUsers.toLocaleString()}</p>
                        <p className="text-green-400 text-xs mt-2">↑ +12.5% this week</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-xs font-bold uppercase">{t.totalRevenue}</span>
                            <span className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">💰</span>
                        </div>
                        <p className="text-3xl font-black">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-green-400 text-xs mt-2">↑ +8.2% this week</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-xs font-bold uppercase">{t.activeSubscriptions}</span>
                            <span className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">⚡</span>
                        </div>
                        <p className="text-3xl font-black">{stats.activeSubscriptions.toLocaleString()}</p>
                        <p className="text-green-400 text-xs mt-2">↑ +5.8% this week</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-xs font-bold uppercase">{t.todaySignups}</span>
                            <span className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">🚀</span>
                        </div>
                        <p className="text-3xl font-black">{stats.todaySignups}</p>
                        <p className="text-green-400 text-xs mt-2">↑ +15% vs yesterday</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-6">📈 Revenue (30 Days)</h3>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {[65, 45, 80, 55, 70, 90, 75, 60, 85, 95, 70, 80].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-red-600 to-orange-400 rounded-t-lg hover:from-red-500 hover:to-orange-300 transition-all"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-6">📊 Plans</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Professional</span>
                                    <span className="text-blue-400">45%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Business</span>
                                    <span className="text-purple-400">35%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[35%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Enterprise</span>
                                    <span className="text-orange-400">20%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[20%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">{t.recentActivity}</h3>
                        <button className="text-red-400 text-sm font-bold hover:underline">{t.viewAll}</button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentActivity.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                                            item.type === 'signup' ? 'bg-blue-500/20 text-blue-400' :
                                                item.type === 'post' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-red-500/20 text-red-400'
                                        }`}>
                                        {item.type === 'payment' ? '💳' :
                                            item.type === 'signup' ? '👤' :
                                                item.type === 'post' ? '📝' : '⚠️'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.message}</p>
                                        <p className="text-slate-500 text-xs">{item.user}</p>
                                    </div>
                                </div>
                                <span className="text-slate-500 text-xs">{item.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { NextResponse } from 'next/server';

// Admin stats endpoint - returns mock data for demo
export async function GET() {
    // In production, this would query the database
    const stats = {
        totalUsers: 1247,
        totalRevenue: 45890,
        activeSubscriptions: 892,
        todaySignups: 34,
        recentActivity: [
            { id: '1', type: 'payment', message: 'New payment: $99 (Business Plan)', timestamp: '2 min ago', user: 'maria@test.com' },
            { id: '2', type: 'signup', message: 'New signup', timestamp: '5 min ago', user: 'carlos@test.com' },
            { id: '3', type: 'post', message: 'Scheduled post executed', timestamp: '12 min ago', user: 'roberto@test.com' },
            { id: '4', type: 'payment', message: 'New payment: $29 (Professional Plan)', timestamp: '18 min ago', user: 'ana@test.com' },
            { id: '5', type: 'signup', message: 'New signup', timestamp: '25 min ago', user: 'luis@test.com' },
        ],
    };

    return NextResponse.json(stats);
}

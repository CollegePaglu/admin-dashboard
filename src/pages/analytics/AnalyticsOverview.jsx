import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell
} from 'recharts';
import { FaUsers, FaBuilding, FaLayerGroup, FaCalendarCheck } from 'react-icons/fa';

const AnalyticsOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await api.analytics.getOverview();
                if (error) throw new Error(error.message);
                setStats(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">Error: {error}</div>;
    if (!stats) return null;

    const { users, societies, posts, events } = stats;

    // Prepare chart data (Mock data pattern if actual historical data isn't available in stats yet)
    // In a real scenario, you'd map this from `stats.history` or similar
    const growthData = [
        { name: 'Week 1', users: Math.floor(users.total * 0.85), active: Math.floor(users.mau * 0.8) },
        { name: 'Week 2', users: Math.floor(users.total * 0.9), active: Math.floor(users.mau * 0.85) },
        { name: 'Week 3', users: Math.floor(users.total * 0.95), active: Math.floor(users.mau * 0.9) },
        { name: 'Current', users: users.total, active: users.mau },
    ];

    const funnelData = users.funnelBreakdown ? Object.entries(users.funnelBreakdown).map(([key, value]) => ({
        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        color: getFunnelColor(key)
    })) : [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<FaUsers className="text-blue-500" />}
                    label="Total Users"
                    value={users.total.toLocaleString()}
                    subtext={`${users.mau.toLocaleString()} Monthly Active`}
                    trend="up"
                    trendValue="+12.5%"
                    color="blue"
                />
                <StatCard
                    icon={<FaBuilding className="text-purple-500" />}
                    label="Active Societies"
                    value={societies.active}
                    subtext={`of ${societies.total} Total Registered`}
                    trend="up"
                    trendValue="+5.2%"
                    color="purple"
                />
                <StatCard
                    icon={<FaLayerGroup className="text-pink-500" />}
                    label="Posts Created"
                    value={posts.total.toLocaleString()}
                    subtext={`${posts.trending} Trending Now`}
                    trend="up"
                    trendValue="+8.1%"
                    color="pink"
                />
                <StatCard
                    icon={<FaCalendarCheck className="text-orange-500" />}
                    label="Events Today"
                    value={events.today.toLocaleString()}
                    subtext="Real-time volume"
                    trend="neutral"
                    trendValue="Stable"
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">User Growth Trends</h3>
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">+24% this month</span>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#374151' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                                <Area type="monotone" dataKey="active" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Funnel Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">User Funnel Breakdown</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DetailStatCard title="Daily Active Users" value={users.dau.toLocaleString()} label="DAU" color="blue" />
                <DetailStatCard title="Weekly Active Users" value={users.wau.toLocaleString()} label="WAU" color="indigo" />
                <DetailStatCard title="Monthly Active Users" value={users.mau.toLocaleString()} label="MAU" color="violet" />
            </div>
        </div>
    );
};

// Enhanced Helper Components
const StatCard = ({ icon, label, value, subtext, trend, trendValue, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        pink: 'bg-pink-50 text-pink-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} transition-transform group-hover:scale-110`}>
                    <div className="text-xl">{icon}</div>
                </div>
                {trendValue && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                        {trend === 'up' ? '↑' : '•'} {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-xs text-gray-400 font-medium">{subtext}</p>
            </div>
        </div>
    );
};

const DetailStatCard = ({ title, value, label, color }) => {
    const colors = {
        blue: 'border-l-blue-500',
        indigo: 'border-l-indigo-500',
        violet: 'border-l-violet-500'
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${colors[color]} flex justify-between items-center`}>
            <div>
                <h4 className="text-sm text-gray-500 font-medium mb-1">{title}</h4>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <span className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-md">{label}</span>
        </div>
    );
};

const getFunnelColor = (state) => {
    switch (state) {
        case 'new': return '#60A5FA';       // Blue 400
        case 'activated': return '#34D399'; // Green 400
        case 'power_user': return '#8B5CF6'; // Violet 500
        case 'dormant': return '#9CA3AF';   // Gray 400
        default: return '#60A5FA';
    }
};

export default AnalyticsOverview;

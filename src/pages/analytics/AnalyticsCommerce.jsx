import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FaShoppingCart, FaRupeeSign, FaStore, FaChartLine } from 'react-icons/fa';

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'];

const AnalyticsCommerce = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.analytics.getCommerce().then(({ data, error }) => {
            if (error) setError(error.message);
            else setData(data?.data || null);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-500)]"></div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">Error: {error}</div>;
    if (!data) return null;

    const { overview = {}, statusBreakdown = {}, revenueTimeline = [] } = data;

    const gmv = overview.totalGMV || 0;
    const orders = overview.totalOrders || 0;
    const aov = overview.avgOrderValue || 0;
    const platformRevenue = overview.platformFeeRevenue || 0;

    const statusChartData = Object.entries(statusBreakdown).map(([name, value]) => ({
        name: name.toUpperCase(), value: Number(value),
    }));

    const timelineData = revenueTimeline.length > 0 ? revenueTimeline : [];

    return (
        <div className="space-y-8 animate-fade-in fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard icon={<FaRupeeSign className="text-green-600" />} label="GMV (30d)" value={`₹${gmv.toLocaleString()}`} subtext="Gross Merchandise Value" color="green" />
                <KpiCard icon={<FaShoppingCart className="text-[var(--brand-500)]" />} label="Orders (30d)" value={orders.toLocaleString()} subtext="Successful payments" color="brand" />
                <KpiCard icon={<FaChartLine className="text-teal-600" />} label="Avg Order Value" value={`₹${Math.round(aov).toLocaleString()}`} subtext="Per completed order" color="teal" />
                <KpiCard icon={<FaStore className="text-emerald-600" />} label="Platform Revenue" value={`₹${platformRevenue.toLocaleString()}`} subtext="Fees collected" color="emerald" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Timeline */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                        <span className="bg-green-50 p-2 rounded-lg border border-green-100"><FaChartLine className="text-green-600" /></span>
                        Daily Revenue (Last 7 Days)
                    </h3>
                    <div className="h-80">
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dx={-10} tickFormatter={v => `₹${v}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} formatter={v => [`₹${v}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No successful orders in the last 7 days" />
                        )}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                        <span className="bg-green-50 p-2 rounded-lg border border-green-100"><FaShoppingCart className="text-[var(--brand-500)]" /></span>
                        Order Status (30d)
                    </h3>
                    <div className="h-80">
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                                        {statusChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No order data yet" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyChart = ({ message }) => (
    <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium flex-col gap-3">
        <span className="text-4xl opacity-50">📭</span>
        <span>{message}</span>
    </div>
);

const KpiCard = ({ icon, label, value, subtext, color }) => {
    const bg = { green: 'bg-green-50 text-green-600', brand: 'bg-[var(--brand-50)] text-[var(--brand-600)]', teal: 'bg-teal-50 text-teal-600', emerald: 'bg-emerald-50 text-emerald-600' };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 group">
            <div className={`${bg[color] || 'bg-gray-50'} p-3 rounded-xl w-fit mb-5 border border-white group-hover:border-current transition-colors`}>{icon}</div>
            <p className="text-gray-500 text-[13px] font-semibold tracking-wide uppercase mb-1.5">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{value}</h3>
            <p className="text-xs text-gray-400 font-medium">{subtext}</p>
        </div>
    );
};

export default AnalyticsCommerce;

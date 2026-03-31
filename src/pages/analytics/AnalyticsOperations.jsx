import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaPrint, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PIE_COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#064e3b'];

const AnalyticsOperations = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.analytics.getOperations().then(({ data, error }) => {
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

    const { overview = {}, statusBreakdown = {}, volumeTimeline = [] } = data;

    const totalOrders = overview.totalPrintOrders || 0;
    const totalPages = overview.totalPagesPrinted || 0;
    const printRevenue = overview.totalPrintRevenue || 0;
    const avgHours = overview.avgProcessingTimeHours;

    const formatSLA = (h) => {
        if (h === null || h === undefined || isNaN(h)) return '—';
        if (h < 1) return `${Math.round(h * 60)} min`;
        return `${h.toFixed(1)} hrs`;
    };

    const statusChartData = Object.entries(statusBreakdown).map(([name, value]) => ({
        name: name.toUpperCase(), value: Number(value),
    }));

    return (
        <div className="space-y-8 animate-fade-in fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard icon={<FaPrint className="text-teal-600" />} label="Print Jobs (7d)" value={totalOrders.toLocaleString()} subtext={`${totalPages.toLocaleString()} total pages`} color="teal" />
                <KpiCard icon={<FaClock className="text-amber-600" />} label="Avg SLA" value={formatSLA(avgHours)} subtext="From order to completion" color="amber" />
                <KpiCard icon={<FaCheckCircle className="text-[var(--brand-500)]" />} label="Print Revenue (7d)" value={`₹${printRevenue.toLocaleString()}`} subtext="LazyPeeps collections" color="brand" />
                <KpiCard
                    icon={<FaTimesCircle className="text-red-600" />}
                    label="Rejected Jobs"
                    value={(statusBreakdown['rejected'] || statusBreakdown['REJECTED'] || 0).toLocaleString()}
                    subtext="Cancelled or rejected"
                    color="red"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Volume Timeline */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                        <span className="bg-teal-50 p-2 rounded-lg border border-teal-100"><FaPrint className="text-teal-600" /></span>
                        Daily Print Volume (Last 7 Days)
                    </h3>
                    <div className="h-80">
                        {volumeTimeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeTimeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis yAxisId="left" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dx={-10} />
                                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dx={10} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }} />
                                    <Bar yAxisId="left" dataKey="pages" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Pages Printed" />
                                    <Bar yAxisId="right" dataKey="orders" fill="#99f6e4" radius={[4, 4, 0, 0]} name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="No print jobs in the last 7 days" />
                        )}
                    </div>
                </div>

                {/* SLA Status Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                        <span className="bg-green-50 p-2 rounded-lg border border-green-100"><FaClock className="text-green-600" /></span>
                        Status Breakdown
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
                            <EmptyChart message="No print order data yet" />
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
    const bg = { teal: 'bg-teal-50 text-teal-600', amber: 'bg-amber-50 text-amber-600', brand: 'bg-[var(--brand-50)] text-[var(--brand-600)]', red: 'bg-red-50 text-red-600' };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 group">
            <div className={`${bg[color] || 'bg-gray-50'} p-3 rounded-xl w-fit mb-5 border border-white group-hover:border-current transition-colors`}>{icon}</div>
            <p className="text-gray-500 text-[13px] font-semibold tracking-wide uppercase mb-1.5">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{value}</h3>
            <p className="text-xs text-gray-400 font-medium">{subtext}</p>
        </div>
    );
};

export default AnalyticsOperations;

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api/client';
import './Dashboard.css';

const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

export default function RevenuePage() {
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchRevenue();
    }, [period]);

    const fetchRevenue = async () => {
        setLoading(true);
        const { data: result, error } = await api.get(`/admin/analytics/revenue?period=${period}`);
        if (error) {
            toast.error('Failed to load revenue data');
        } else {
            setData(result);
        }
        setLoading(false);
    };

    const formatCurrency = (value) => `₹${value?.toLocaleString() || 0}`;

    return (
        <div className="page-container">
            <Sidebar active="campusmart-revenue" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>💰 Revenue Analytics</h1>
                        <p>Track income from orders and marketplace</p>
                    </div>
                </div>

                {/* Time Period Filter */}
                <div className="period-filter">
                    {TIME_PERIODS.map(p => (
                        <button
                            key={p}
                            className={`period-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                {data && (
                    <div className="stats-row">
                        <div className="stat-card completed">
                            <h3>📈 Total Revenue</h3>
                            <div className="stat-value">{formatCurrency(data.total)}</div>
                        </div>
                        <div className="stat-card pending">
                            <h3>📦 Total Orders</h3>
                            <div className="stat-value">{data.orderCount}</div>
                        </div>
                        <div className="stat-card inprogress">
                            <h3>📊 Avg Order Value</h3>
                            <div className="stat-value">{formatCurrency(data.averageOrderValue)}</div>
                        </div>
                    </div>
                )}

                {/* Revenue Chart */}
                <div className="chart-container glass">
                    <h2>Revenue Over Time</h2>
                    {loading ? (
                        <div className="loading">Loading chart...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={data?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#16a34a"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Revenue"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Revenue Table */}
                <div className="assignments-list glass">
                    <h2>📋 Daily Breakdown</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Revenue</th>
                                <th>Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.revenue?.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.date}</td>
                                    <td>{formatCurrency(r.amount)}</td>
                                    <td>{r.count}</td>
                                </tr>
                            ))}
                            {(!data?.revenue || data.revenue.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="empty">No revenue data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

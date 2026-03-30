import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api/client';
import './Dashboard.css';

const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

export default function UsersPage() {
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [period]);

    const fetchUsers = async () => {
        setLoading(true);
        const { data: result, error } = await api.get(`/admin/analytics/users?period=${period}`);
        if (error) {
            toast.error('Failed to load users data');
        } else {
            setData(result);
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <Sidebar active="campusmart-users" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>👥 Users Analytics</h1>
                        <p>User growth and activity</p>
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
                            <h3>👥 Total Users</h3>
                            <div className="stat-value">{data.total}</div>
                        </div>
                        <div className="stat-card inprogress">
                            <h3>✅ Active Users</h3>
                            <div className="stat-value">{data.active}</div>
                        </div>
                        <div className="stat-card pending">
                            <h3>🚫 Suspended</h3>
                            <div className="stat-value">{data.total - data.active}</div>
                        </div>
                    </div>
                )}

                {/* User Growth Chart */}
                <div className="chart-container glass">
                    <h2>User Signups Over Time</h2>
                    {loading ? (
                        <div className="loading">Loading chart...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data?.users || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#5b6fd8"
                                    strokeWidth={3}
                                    dot={{ fill: '#5b6fd8' }}
                                    name="New Users"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* User Table */}
                <div className="assignments-list glass">
                    <h2>📅 Daily Signups</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>New Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.users?.map((u, i) => (
                                <tr key={i}>
                                    <td>{u.date}</td>
                                    <td>{u.count}</td>
                                </tr>
                            ))}
                            {(!data?.users || data.users.length === 0) && (
                                <tr>
                                    <td colSpan={2} className="empty">No user data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

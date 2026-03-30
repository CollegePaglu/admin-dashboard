import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../config/constants';
import './Dashboard.css';

const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

export default function CampusMartDashboard() {
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    useEffect(() => {
        fetchAssignmentsList();
    }, [statusFilter]);

    const fetchAnalytics = async () => {
        setLoading(true);
        const { data: result, error } = await api.get(`/admin/analytics/assignments?period=${period}`);
        if (error) {
            toast.error('Failed to load analytics');
        } else {
            setData(result);
        }
        setLoading(false);
    };

    const fetchAssignmentsList = async () => {
        const url = statusFilter
            ? `/admin/analytics/assignments/list?status=${statusFilter}`
            : '/admin/analytics/assignments/list';
        const { data: result, error } = await api.get(url);
        if (!error && result) {
            setAssignments(result.assignments || []);
        }
    };

    // Merge chart data for combined view
    const mergeChartData = () => {
        if (!data) return [];
        const dateMap = new Map();

        data.completed?.forEach(item => {
            dateMap.set(item.date, { ...dateMap.get(item.date), date: item.date, completed: item.count });
        });
        data.pending?.forEach(item => {
            dateMap.set(item.date, { ...dateMap.get(item.date), date: item.date, pending: item.count });
        });
        data.inProgress?.forEach(item => {
            dateMap.set(item.date, { ...dateMap.get(item.date), date: item.date, inProgress: item.count });
        });

        return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    };

    const chartData = mergeChartData();

    return (
        <div className="page-container">
            <Sidebar active="campusmart-dashboard" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>📊 CampusMart Dashboard</h1>
                        <p>Assignments overview and analytics</p>
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
                {data?.counts && (
                    <div className="stats-row">
                        <div className="stat-card completed">
                            <h3>✅ Completed</h3>
                            <div className="stat-value">{data.counts.completed}</div>
                        </div>
                        <div className="stat-card pending">
                            <h3>⏳ Pending</h3>
                            <div className="stat-value">{data.counts.pending}</div>
                        </div>
                        <div className="stat-card inprogress">
                            <h3>🔄 In Progress</h3>
                            <div className="stat-value">{data.counts.inProgress}</div>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="chart-container glass">
                    <h2>Assignments Over Time</h2>
                    {loading ? (
                        <div className="loading">Loading chart...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" fill="#16a34a" name="Completed" />
                                <Bar dataKey="pending" fill="#ea580c" name="Pending" />
                                <Bar dataKey="inProgress" fill="#2563eb" name="In Progress" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Assignments List */}
                <div className="assignments-list glass">
                    <div className="list-header">
                        <h2>📝 Assignment Details</h2>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="status-filter"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Requester</th>
                                <th>Alpha</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(a => (
                                <tr key={a._id}>
                                    <td>{a.subject || 'N/A'}</td>
                                    <td>{a.type || 'N/A'}</td>
                                    <td>{a.requester?.firstName || a.requester?.displayName || 'N/A'}</td>
                                    <td>{a.alphaId?.firstName || 'Unassigned'}</td>
                                    <td>₹{a.agreedPrice || a.budget || 0}</td>
                                    <td>
                                        <span className={`status-badge ${a.status}`}>
                                            {a.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="empty">No assignments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

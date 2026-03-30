import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api/client';
import './Dashboard.css';

export default function AlphasPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAlphas();
    }, []);

    const fetchAlphas = async () => {
        setLoading(true);
        const { data: result, error } = await api.get('/admin/analytics/alphas');
        if (error) {
            toast.error('Failed to load alphas data');
        } else {
            setData(result);
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <Sidebar active="campusmart-alphas" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>⭐ Alphas Analytics</h1>
                        <p>Top performers and activity overview</p>
                    </div>
                </div>

                {/* Stats Cards */}
                {data?.counts && (
                    <div className="stats-row">
                        <div className="stat-card completed">
                            <h3>✅ Active</h3>
                            <div className="stat-value">{data.counts.active}</div>
                        </div>
                        <div className="stat-card pending">
                            <h3>⏳ Pending</h3>
                            <div className="stat-value">{data.counts.pending}</div>
                        </div>
                        <div className="stat-card inprogress">
                            <h3>🔒 Verified</h3>
                            <div className="stat-value">{data.counts.verified}</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {/* Top Alphas */}
                        <div className="assignments-list glass" style={{ marginBottom: '2rem' }}>
                            <h2>🏆 Top Performing Alphas</h2>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Completed</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.topAlphas?.map((alpha, i) => (
                                        <tr key={alpha._id}>
                                            <td>#{i + 1}</td>
                                            <td>
                                                {alpha.userId?.firstName || 'Unknown'} {alpha.userId?.lastName || ''}
                                            </td>
                                            <td>{alpha.userId?.phone || 'N/A'}</td>
                                            <td><strong>{alpha.completedAssignments || 0}</strong></td>
                                            <td>⭐ {alpha.rating?.toFixed(1) || '0.0'}</td>
                                        </tr>
                                    ))}
                                    {(!data?.topAlphas || data.topAlphas.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="empty">No alphas found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Recent Assignments */}
                        <div className="assignments-list glass">
                            <h2>📝 Recent Assignments</h2>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Requester</th>
                                        <th>Alpha</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.recentAssignments?.map(a => (
                                        <tr key={a._id}>
                                            <td>{a.subject || 'N/A'}</td>
                                            <td>{a.requester?.firstName || a.requester?.displayName || 'N/A'}</td>
                                            <td>{a.alphaId?.firstName || 'Unassigned'}</td>
                                            <td>
                                                <span className={`status-badge ${a.status}`}>
                                                    {a.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

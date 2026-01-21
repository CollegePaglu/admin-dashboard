import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { ENDPOINTS, ALPHA_STATUS, STATUS_COLORS } from '../config/constants';
import { formatStatus } from '../utils/formatters';
import './Alphas.css';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function AlphasPage() {
    const [alphas, setAlphas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlphas();
    }, []);

    const fetchAlphas = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.ALPHAS);

        if (error) {
            toast.error('Failed to load alphas');
        } else {
            setAlphas(data.alphas || data.data || []);
        }
        setLoading(false);
    };

    const handleVerify = async (id) => {
        const { error } = await api.post(ENDPOINTS.VERIFY_ALPHA(id));

        if (error) {
            toast.error('Failed to verify alpha');
        } else {
            toast.success('Alpha verified successfully');
            setAlphas(alphas.map(a => a._id === id ? { ...a, status: 'verified' } : a));
        }
    };

    const handleSuspend = async (id) => {
        const { error } = await api.post(ENDPOINTS.SUSPEND_ALPHA(id));

        if (error) {
            toast.error('Failed to suspend alpha');
        } else {
            toast.success('Alpha suspended');
            setAlphas(alphas.map(a => a._id === id ? { ...a, status: 'suspended' } : a));
        }
    };

    return (
        <div className="page-container">
            <Sidebar active="alphas" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Alphas Management</h1>
                        <p>Manage alpha users and their verification status</p>
                    </div>
                    <button className="btn-primary" onClick={fetchAlphas}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <div className="toolbar-stats">
                        <span>Total Alphas: <strong>{alphas.length}</strong></span>
                        <span>Verified: <strong>{alphas.filter(a => a.status === 'verified').length}</strong></span>
                        <span>Pending: <strong>{alphas.filter(a => a.status === 'pending').length}</strong></span>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading alphas...</div>
                ) : (
                    <div className="alphas-grid">
                        {alphas.length === 0 ? (
                            <div className="empty-message">No alphas found</div>
                        ) : alphas.map((alpha) => (
                            <div key={alpha._id} className="alpha-card glass">
                                <div className="alpha-header">
                                    <h3>{alpha.user?.name || 'Unknown'}</h3>
                                    <StatusBadge status={alpha.status} />
                                </div>
                                <div className="alpha-details">
                                    <p><strong>Skills:</strong> {alpha.skills?.join(', ') || 'N/A'}</p>
                                    <p><strong>Rating:</strong> ⭐ {alpha.rating?.toFixed(1) || '0.0'}</p>
                                    <p><strong>Completed:</strong> {alpha.completedAssignments || 0} assignments</p>
                                </div>
                                <div className="alpha-actions">
                                    {alpha.status === 'pending' && (
                                        <button className="btn-verify" onClick={() => handleVerify(alpha._id)}>
                                            ✓ Verify Alpha
                                        </button>
                                    )}
                                    {alpha.status === 'verified' && (
                                        <button className="btn-suspend" onClick={() => handleSuspend(alpha._id)}>
                                            ⚠️ Suspend
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

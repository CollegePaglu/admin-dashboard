import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../api/client';
import { ENDPOINTS } from '../config/constants';
import { formatRelativeTime, getInitials } from '../utils/formatters';
import './Societies.css';

function SocietyStatusBadge({ isVerified, isSuspended }) {
    if (isSuspended) {
        return <span className="society-status-suspended">🚫 Suspended</span>;
    }
    if (isVerified) {
        return <span className="society-status-verified">✅ Verified</span>;
    }
    return <span className="society-status-pending">⏳ Pending</span>;
}

export default function SocietiesPage() {
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
    });

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.SOCIETIES, {
            params: { page: 1, limit: 100 },
        });

        if (error) {
            toast.error('Failed to load societies');
        } else {
            // Backend returns { success, data: [...societies], pagination }
            // api.get wraps it as { data: { success, data: [...], pagination } }
            const responseBody = data;
            const list = responseBody?.data?.societies || responseBody?.data || responseBody?.societies || [];
            setSocieties(Array.isArray(list) ? list : []);
        }
        setLoading(false);
    };

    const handleVerify = (id, name) => {
        setConfirmDialog({
            open: true,
            title: 'Verify Society',
            message: `Are you sure you want to verify "${name}"? They will be able to log in and post content.`,
            onConfirm: async () => {
                const { error } = await api.post(ENDPOINTS.VERIFY_SOCIETY(id));
                if (error) {
                    toast.error('Failed to verify society');
                } else {
                    toast.success(`"${name}" has been verified!`);
                    setSocieties((prev) =>
                        prev.map((s) =>
                            s._id === id ? { ...s, isVerified: true, verifiedAt: new Date().toISOString() } : s
                        )
                    );
                }
                setConfirmDialog((p) => ({ ...p, open: false }));
            },
        });
    };

    const handleSuspend = (id, name) => {
        setConfirmDialog({
            open: true,
            title: 'Suspend Society',
            message: `Are you sure you want to suspend "${name}"? They will not be able to log in.`,
            onConfirm: async () => {
                const { error } = await api.post(ENDPOINTS.SUSPEND_SOCIETY(id), {
                    reason: 'Suspended by admin',
                });
                if (error) {
                    toast.error('Failed to suspend society');
                } else {
                    toast.success(`"${name}" has been suspended`);
                    setSocieties((prev) =>
                        prev.map((s) =>
                            s._id === id
                                ? { ...s, isSuspended: true, suspendedAt: new Date().toISOString() }
                                : s
                        )
                    );
                }
                setConfirmDialog((p) => ({ ...p, open: false }));
            },
        });
    };

    const handleUnsuspend = (id, name) => {
        setConfirmDialog({
            open: true,
            title: 'Unsuspend Society',
            message: `Are you sure you want to unsuspend "${name}"? This will also verify them.`,
            onConfirm: async () => {
                const { error } = await api.post(ENDPOINTS.VERIFY_SOCIETY(id));
                if (error) {
                    toast.error('Failed to unsuspend society');
                } else {
                    toast.success(`"${name}" has been unsuspended and verified`);
                    setSocieties((prev) =>
                        prev.map((s) =>
                            s._id === id
                                ? { ...s, isSuspended: false, isVerified: true, verifiedAt: new Date().toISOString() }
                                : s
                        )
                    );
                }
                setConfirmDialog((p) => ({ ...p, open: false }));
            },
        });
    };

    const handleDelete = (id, name) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Society',
            message: `Are you absolutely sure you want to permanently delete "${name}"? This action cannot be undone.`,
            onConfirm: async () => {
                const { error } = await api.delete(ENDPOINTS.DELETE_SOCIETY(id));
                if (error) {
                    toast.error('Failed to delete society');
                } else {
                    toast.success(`"${name}" has been deleted`);
                    setSocieties((prev) => prev.filter((s) => s._id !== id));
                }
                setConfirmDialog((p) => ({ ...p, open: false }));
            },
        });
    };

    // Filtering
    const filteredSocieties = societies.filter((s) => {
        if (activeFilter === 'pending') return !s.isVerified && !s.isSuspended;
        if (activeFilter === 'verified') return s.isVerified && !s.isSuspended;
        if (activeFilter === 'suspended') return s.isSuspended;
        return true;
    });

    const counts = {
        all: societies.length,
        pending: societies.filter((s) => !s.isVerified && !s.isSuspended).length,
        verified: societies.filter((s) => s.isVerified && !s.isSuspended).length,
        suspended: societies.filter((s) => s.isSuspended).length,
    };

    const columns = [
        {
            key: 'society',
            label: 'Society',
            sortable: false,
            render: (_, row) => (
                <div className="society-detail-row">
                    <div className="society-avatar">
                        {row.avatar ? (
                            <img src={row.avatar} alt={row.name} />
                        ) : (
                            getInitials(row.name || 'S')
                        )}
                    </div>
                    <div className="society-info">
                        <div className="society-name">{row.name}</div>
                        <div className="society-email">{row.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'poc',
            label: 'Point of Contact',
            sortable: false,
            render: (_, row) => (
                <div className="poc-cell">
                    <div className="poc-name">{row.poc?.name || 'N/A'}</div>
                    <div className="poc-contact">{row.poc?.phone || ''}</div>
                    <div className="poc-contact">{row.poc?.email || ''}</div>
                </div>
            ),
        },
        {
            key: 'college',
            label: 'College',
            sortable: false,
            render: (_, row) => {
                const college = row.collegeId;
                return (
                    <div>
                        <div className="college-cell">
                            {typeof college === 'object' ? college?.name : 'N/A'}
                        </div>
                        {typeof college === 'object' && college?.location && (
                            <div className="college-location">{college.location}</div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (_, row) => (
                <SocietyStatusBadge isVerified={row.isVerified} isSuspended={row.isSuspended} />
            ),
        },
        {
            key: 'createdAt',
            label: 'Registered',
            render: (val) => (
                <span className="text-sm text-gray-500">{formatRelativeTime(val)}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => {
                const isPending = !row.isVerified && !row.isSuspended;
                const isVerified = row.isVerified && !row.isSuspended;
                const isSuspended = row.isSuspended;

                return (
                    <div className="flex gap-2">
                        {isPending && (
                            <button
                                className="btn-verify"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerify(row._id, row.name);
                                }}
                            >
                                ✅ Verify
                            </button>
                        )}
                        {isVerified && (
                            <button
                                className="btn-suspend"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSuspend(row._id, row.name);
                                }}
                            >
                                🚫 Suspend
                            </button>
                        )}
                        {isSuspended && (
                            <button
                                className="btn-verify"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnsuspend(row._id, row.name);
                                }}
                            >
                                🔓 Unsuspend
                            </button>
                        )}
                        <button
                            className="btn-suspend"
                            style={{ backgroundColor: '#ef4444', color: 'white' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row._id, row.name);
                            }}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="page-container">
            <Sidebar active="societies" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>🏛️ Societies Management</h1>
                        <p>Review, verify, and manage college society registrations</p>
                    </div>
                    <button className="btn-primary" onClick={fetchSocieties}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <div className="toolbar-stats">
                        <span>
                            Total: <strong>{counts.all}</strong>
                        </span>
                        <span>
                            Pending: <strong style={{ color: '#d97706' }}>{counts.pending}</strong>
                        </span>
                        <span>
                            Verified: <strong style={{ color: '#059669' }}>{counts.verified}</strong>
                        </span>
                        <span>
                            Suspended: <strong style={{ color: '#dc2626' }}>{counts.suspended}</strong>
                        </span>
                    </div>
                </div>

                <div className="filter-tabs">
                    {['all', 'pending', 'verified', 'suspended'].map((tab) => (
                        <button
                            key={tab}
                            className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                            onClick={() => setActiveFilter(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
                        </button>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={filteredSocieties}
                    loading={loading}
                    emptyMessage={
                        activeFilter === 'pending'
                            ? 'No pending society registrations 🎉'
                            : 'No societies found'
                    }
                />

                {confirmDialog.open && (
                    <ConfirmDialog
                        isOpen={confirmDialog.open}
                        title={confirmDialog.title}
                        message={confirmDialog.message}
                        onConfirm={confirmDialog.onConfirm}
                        onClose={() => setConfirmDialog((p) => ({ ...p, open: false }))}
                    />
                )}
            </main>
        </div>
    );
}

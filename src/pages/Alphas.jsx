import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import { ENDPOINTS, ALPHA_STATUS, STATUS_COLORS } from '../config/constants';
import { formatStatus, getInitials } from '../utils/formatters';
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
            console.log('Alphas Fetch Data:', data); // Debug log
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

    const handleUnsuspend = async (id) => {
        const { error } = await api.post(ENDPOINTS.VERIFY_ALPHA(id));

        if (error) {
            toast.error('Failed to unsuspend alpha');
        } else {
            toast.success('Alpha unsuspended and verified');
            setAlphas(alphas.map(a => a._id === id ? { ...a, status: 'verified' } : a));
        }
    };

    const columns = [
        {
            key: 'user',
            label: 'User',
            sortable: false,
            render: (_user, row) => {
                const user = row.user;
                const displayName = user?.displayName ||
                    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
                    'Unknown';

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(displayName)
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {displayName}
                            </div>
                            {user?.email && (
                                <div className="text-xs text-gray-500">{user.email}</div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'college',
            label: 'College & ID',
            sortable: false,
            render: (_col, row) => {
                const user = row.user;
                return (
                    <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-900">{user?.college?.name || 'N/A'}</span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                            {row.collegeId && (
                                <span className="text-xs font-semibold text-gray-700">
                                    ID: {row.collegeId}
                                </span>
                            )}
                            <span className="text-xs text-gray-500">Roll: {user?.college?.rollNumber || 'N/A'}</span>
                        </div>
                        {user?.collegeIdCardUrl && (
                            <a
                                href={user.collegeIdCardUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                            >
                                View ID Card
                            </a>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'skills',
            label: 'Skills',
            sortable: false,
            render: (skills) => <div className="skills-cell" title={skills?.join(', ')}>{skills?.slice(0, 3).join(', ') || 'N/A'}{skills?.length > 3 ? '...' : ''}</div>
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (rating) => <div className="rating-cell"><span>⭐</span> {rating?.toFixed(1) || '0.0'}</div>
        },
        {
            key: 'completedAssignments',
            label: 'Completed',
            render: (val) => val || 0
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex gap-2">
                    {row.status === 'pending' && (
                        <button className="btn-verify" onClick={(e) => { e.stopPropagation(); handleVerify(row._id); }}>
                            Verify
                        </button>
                    )}
                    {row.status === 'verified' && (
                        <button className="btn-suspend" onClick={(e) => { e.stopPropagation(); handleSuspend(row._id); }}>
                            Suspend
                        </button>
                    )}
                    {row.status === 'suspended' && (
                        <button className="btn-verify" onClick={(e) => { e.stopPropagation(); handleUnsuspend(row._id); }}>
                            Unsuspend
                        </button>
                    )}
                </div>
            )
        }
    ];

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

                <DataTable
                    columns={columns}
                    data={alphas}
                    loading={loading}
                    emptyMessage="No alphas found"
                />
            </main>
        </div>
    );
}

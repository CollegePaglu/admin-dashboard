import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import { ENDPOINTS, PAYMENT_STATUS, STATUS_COLORS } from '../config/constants';
import { formatCurrency, formatDate, formatStatus } from '../utils/formatters';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function PaymentsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.PAYMENT_REQUESTS);

        if (error) {
            toast.error('Failed to load payment requests');
        } else {
            setRequests(data.requests || data.data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const { error } = await api.post(ENDPOINTS.APPROVE_PAYMENT(id));

        if (error) {
            toast.error('Failed to approve payment');
        } else {
            toast.success('Payment approved successfully');
            setRequests(requests.filter(r => r._id !== id));
        }
    };

    const handleReject = async (id) => {
        const { error } = await api.post(ENDPOINTS.REJECT_PAYMENT(id));

        if (error) {
            toast.error('Failed to reject payment');
        } else {
            toast.success('Payment rejected');
            setRequests(requests.filter(r => r._id !== id));
        }
    };

    const columns = [
        {
            key: 'requesterId',
            label: 'Requester',
            render: (requester) => requester?.name || 'N/A'
        },
        { key: 'requesterType', label: 'Type' },
        {
            key: 'amount',
            label: 'Amount',
            render: (amount) => formatCurrency(amount)
        },
        {
            key: 'netAmount',
            label: 'Net Amount',
            render: (amount) => formatCurrency(amount)
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, request) => (
                request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-approve-small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(request._id);
                            }}
                        >
                            ✓ Approve
                        </button>
                        <button
                            className="btn-reject-small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReject(request._id);
                            }}
                        >
                            ✕ Reject
                        </button>
                    </div>
                )
            )
        },
    ];

    return (
        <div className="page-container">
            <Sidebar active="payments" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Payment Requests</h1>
                        <p>Manage payment requests from sellers and alphas</p>
                    </div>
                    <button className="btn-primary" onClick={fetchPayments}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <div className="toolbar-stats">
                        <span>Total Requests: <strong>{requests.length}</strong></span>
                        <span>Pending: <strong>{requests.filter(r => r.status === 'pending').length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={requests}
                    loading={loading}
                    emptyMessage="No payment requests"
                />
            </main>
        </div>
    );
}

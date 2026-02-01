import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import { api } from '../api/client';
import { ENDPOINTS, STATUS_COLORS } from '../config/constants';
import { formatCurrency, formatDate, formatStatus } from '../utils/formatters';
import './Transactions.css';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.TRANSACTIONS);

        if (error) {
            toast.error('Failed to load transactions');
            console.error('Error:', error);
        } else {
            const items = Array.isArray(data) ? data : (data.data || data.transactions || []);
            setTransactions(items);
        }
        setLoading(false);
    };

    const filteredTransactions = transactions.filter(tx =>
        tx._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: '_id',
            label: 'Transaction ID',
            render: (id) => <span className="font-mono text-sm">{id?.slice(-8).toUpperCase()}</span>
        },
        {
            key: 'type',
            label: 'Type',
            render: (type) => (
                <span className="capitalize font-medium">
                    {type?.replace(/_/g, ' ') || 'N/A'}
                </span>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (amount) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(amount)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'paymentMethod',
            label: 'Method',
            render: (method) => method || 'N/A'
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (date) => formatDate(date)
        },
    ];

    return (
        <div className="page-container">
            <Sidebar active="transactions" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Transactions</h1>
                        <p>View all platform transactions</p>
                    </div>
                    <button className="btn-primary" onClick={fetchTransactions}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <SearchBar
                        placeholder="Search by ID, type, or status..."
                        onSearch={setSearchTerm}
                    />
                    <div className="toolbar-stats">
                        <span>Total Transactions: <strong>{transactions.length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredTransactions}
                    loading={loading}
                    emptyMessage="No transactions found"
                />
            </main>
        </div>
    );
}

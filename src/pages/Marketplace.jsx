import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../api/client';
import { ENDPOINTS, LISTING_STATUS, STATUS_COLORS } from '../config/constants';
import { formatCurrency, formatDate, formatStatus } from '../utils/formatters';
import './Marketplace.css';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function MarketplacePage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, listing: null });

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.ITEMS);

        if (error) {
            toast.error('Failed to load marketplace items');
        } else {
            setListings(data.items || data.data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (listing) => {
        const { error } = await api.delete(ENDPOINTS.LISTING_BY_ID(listing._id));

        if (error) {
            toast.error('Failed to delete listing');
        } else {
            toast.success('Listing deleted successfully');
            setListings(listings.filter(l => l._id !== listing._id));
        }
        setDeleteDialog({ open: false, listing: null });
    };

    const filteredListings = listings.filter(listing =>
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price', render: (price) => formatCurrency(price) },
        {
            key: 'sellerId',
            label: 'Seller',
            render: (seller) => seller?.name || 'N/A'
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'createdAt',
            label: 'Listed',
            render: (date) => formatDate(date)
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, listing) => (
                <button
                    className="btn-delete-small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, listing });
                    }}
                >
                    🗑️
                </button>
            )
        },
    ];

    return (
        <div className="page-container">
            <Sidebar active="marketplace" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Marketplace Management</h1>
                        <p>Manage all marketplace listings</p>
                    </div>
                    <button className="btn-primary" onClick={fetchListings}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <SearchBar
                        placeholder="Search by title or category..."
                        onSearch={setSearchTerm}
                    />
                    <div className="toolbar-stats">
                        <span>Total Listings: <strong>{listings.length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredListings}
                    loading={loading}
                    emptyMessage="No listings found"
                />

                <ConfirmDialog
                    isOpen={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, listing: null })}
                    onConfirm={() => handleDelete(deleteDialog.listing)}
                    title="Delete Listing"
                    message={`Are you sure you want to delete "${deleteDialog.listing?.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    type="danger"
                />
            </main>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { ENDPOINTS, ORDER_STATUS, STATUS_COLORS } from '../config/constants';
import { formatCurrency, formatDate, formatStatus } from '../utils/formatters';
import './Orders.css';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await api.get(ENDPOINTS.ORDERS);

        if (error) {
            toast.error('Failed to load orders');
        } else {
            setOrders(data.orders || data.data || []);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(true);
        const { error } = await api.patch(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status: newStatus });

        if (error) {
            toast.error('Failed to update order status');
        } else {
            toast.success('Order status updated');
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        }
        setUpdating(false);
    };

    const columns = [
        { key: 'orderNumber', label: 'Order #' },
        {
            key: 'buyerId',
            label: 'Buyer',
            render: (buyer) => buyer?.name || 'N/A'
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            render: (amount) => formatCurrency(amount)
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (date) => formatDate(date)
        },
    ];

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div className="page-container">
            <Sidebar active="orders" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Orders Management</h1>
                        <p>Track and manage all orders</p>
                    </div>
                    <button className="btn-primary" onClick={fetchOrders}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <div className="toolbar-stats">
                        <span>Total Orders: <strong>{orders.length}</strong></span>
                        <span>Pending: <strong>{orders.filter(o => o.status === 'pending').length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={orders}
                    loading={loading}
                    emptyMessage="No orders found"
                    onRowClick={handleRowClick}
                />

                {showModal && selectedOrder && (
                    <Modal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        title={`Order #${selectedOrder.orderNumber}`}
                        size="medium"
                    >
                        <div className="order-details">
                            <div className="detail-row">
                                <label>Buyer:</label>
                                <span>{selectedOrder.buyerId?.name || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Seller:</label>
                                <span>{selectedOrder.sellerId?.name || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Amount:</label>
                                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                            </div>
                            <div className="detail-row">
                                <label>Status:</label>
                                <StatusBadge status={selectedOrder.status} />
                            </div>
                            <div className="detail-row">
                                <label>Created:</label>
                                <span>{formatDate(selectedOrder.createdAt)}</span>
                            </div>

                            <div className="status-actions">
                                <h4>Update Status:</h4>
                                <div className="status-buttons">
                                    {Object.values(ORDER_STATUS).map(status => (
                                        <button
                                            key={status}
                                            className={`btn-status ${selectedOrder.status === status ? 'active' : ''}`}
                                            onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                                            disabled={updating || selectedOrder.status === status}
                                        >
                                            {formatStatus(status)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
}

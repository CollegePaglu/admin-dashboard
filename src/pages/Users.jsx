import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { ENDPOINTS } from '../config/constants';
import { formatDate, formatPhoneNumber } from '../utils/formatters';
import './Users.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await api.get('/admin/users');

        if (error) {
            toast.error('Failed to load users');
            console.error('Error loading users:', error);
        } else {
            setUsers(data.data || data.users || []);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.collegeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (phone) => formatPhoneNumber(phone) },
        { key: 'collegeId', label: 'College ID' },
        { key: 'role', label: 'Role', render: (role) => <span className="role-badge">{role}</span> },
        { key: 'createdAt', label: 'Joined', render: (date) => formatDate(date) },
    ];

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <div className="page-container">
            <Sidebar active="users" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage all registered users on the platform</p>
                    </div>
                    <button className="btn-primary" onClick={fetchUsers}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <SearchBar
                        placeholder="Search users by name, email, or college ID..."
                        onSearch={setSearchTerm}
                    />
                    <div className="toolbar-stats">
                        <span>Total Users: <strong>{users.length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    loading={loading}
                    emptyMessage="No users found"
                    onRowClick={handleRowClick}
                />

                {showModal && selectedUser && (
                    <Modal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        title="User Details"
                        size="medium"
                    >
                        <div className="user-details">
                            <div className="detail-row">
                                <label>Name:</label>
                                <span>{selectedUser.name}</span>
                            </div>
                            <div className="detail-row">
                                <label>Email:</label>
                                <span>{selectedUser.email || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Phone:</label>
                                <span>{formatPhoneNumber(selectedUser.phone)}</span>
                            </div>
                            <div className="detail-row">
                                <label>College ID:</label>
                                <span>{selectedUser.collegeId}</span>
                            </div>
                            <div className="detail-row">
                                <label>Role:</label>
                                <span className="role-badge">{selectedUser.role}</span>
                            </div>
                            <div className="detail-row">
                                <label>Joined:</label>
                                <span>{formatDate(selectedUser.createdAt)}</span>
                            </div>
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
}

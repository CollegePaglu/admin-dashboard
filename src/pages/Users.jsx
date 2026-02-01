import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { formatDate, formatPhoneNumber } from '../utils/formatters';
import './Users.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await api.get('/users');

        if (error) {
            toast.error('Failed to load users');
            console.error('Error loading users:', error);
        } else {
            console.log('[Users] API Response:', data);
            const users = Array.isArray(data) ? data :
                Array.isArray(data?.data) ? data.data :
                    [];
            console.log('[Users] Extracted users:', users.length);
            setUsers(users);
        }
        setLoading(false);
    };

    const handleSuspendUser = async (user) => {
        setActionLoading(true);
        const endpoint = user.isActive
            ? `/admin/users/${user._id}/suspend`
            : `/admin/users/${user._id}/unsuspend`;

        const { error } = await api.post(endpoint, { reason: 'Admin action' });

        if (error) {
            toast.error(`Failed to ${user.isActive ? 'suspend' : 'unsuspend'} user`);
        } else {
            toast.success(`User ${user.isActive ? 'suspended' : 'unsuspended'} successfully`);
            fetchUsers();
        }
        setActionLoading(false);
        setShowModal(false);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setActionLoading(true);
        const { error } = await api.delete(`/admin/users/${selectedUser._id}`);

        if (error) {
            toast.error('Failed to delete user');
        } else {
            toast.success('User deleted successfully');
            fetchUsers();
        }
        setActionLoading(false);
        setShowDeleteDialog(false);
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        setActionLoading(true);
        const { error } = await api.patch(`/admin/users/${selectedUser._id}/role`, { role: newRole });

        if (error) {
            toast.error('Failed to update user role');
        } else {
            toast.success('User role updated successfully');
            fetchUsers();
        }
        setActionLoading(false);
        setShowRoleDialog(false);
        setNewRole('');
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.includes(searchTerm) ||
            user.college?.name?.toLowerCase().includes(searchLower);
    });

    const columns = [
        {
            key: 'firstName',
            label: 'Name',
            render: (_, user) => `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'
        },
        { key: 'email', label: 'Email', render: (email) => email || 'N/A' },
        { key: 'phone', label: 'Phone', render: (phone) => formatPhoneNumber(phone) },
        { key: 'college', label: 'College', render: (college) => college?.name || 'N/A' },
        {
            key: 'role',
            label: 'Role',
            render: (role) => <span className={`role-badge role-${role || 'student'}`}>{role || 'student'}</span>
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (isActive) => (
                <span className={`status-badge ${isActive !== false ? 'status-active' : 'status-suspended'}`}>
                    {isActive !== false ? 'Active' : 'Suspended'}
                </span>
            )
        },
        { key: 'createdAt', label: 'Joined', render: (date) => formatDate(date) },
    ];

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const openRoleDialog = () => {
        setNewRole(selectedUser?.role || 'student');
        setShowRoleDialog(true);
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
                        placeholder="Search users by name, email, or college..."
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

                {/* User Details Modal */}
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
                                <span>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'N/A'}</span>
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
                                <label>College:</label>
                                <span>{selectedUser.college?.name || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Role:</label>
                                <span className={`role-badge role-${selectedUser.role || 'student'}`}>
                                    {selectedUser.role || 'student'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Status:</label>
                                <span className={`status-badge ${selectedUser.isActive !== false ? 'status-active' : 'status-suspended'}`}>
                                    {selectedUser.isActive !== false ? 'Active' : 'Suspended'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Joined:</label>
                                <span>{formatDate(selectedUser.createdAt)}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className={`btn-action ${selectedUser.isActive !== false ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleSuspendUser(selectedUser)}
                                disabled={actionLoading}
                            >
                                {selectedUser.isActive !== false ? '⏸️ Suspend' : '▶️ Unsuspend'}
                            </button>
                            <button
                                className="btn-action btn-secondary"
                                onClick={openRoleDialog}
                                disabled={actionLoading}
                            >
                                🔄 Change Role
                            </button>
                            <button
                                className="btn-action btn-danger"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={actionLoading}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Delete Confirmation Dialog */}
                {showDeleteDialog && (
                    <Modal
                        isOpen={showDeleteDialog}
                        onClose={() => setShowDeleteDialog(false)}
                        title="Confirm Delete"
                        size="small"
                    >
                        <p>Are you sure you want to delete user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?</p>
                        <p className="text-muted">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeleteUser}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Role Update Dialog */}
                {showRoleDialog && (
                    <Modal
                        isOpen={showRoleDialog}
                        onClose={() => setShowRoleDialog(false)}
                        title="Change User Role"
                        size="small"
                    >
                        <div className="form-group">
                            <label>Select new role for {selectedUser?.firstName}:</label>
                            <select
                                className="form-select"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="vendor">Vendor</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowRoleDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleUpdateRole}
                                disabled={actionLoading || !newRole}
                            >
                                {actionLoading ? 'Updating...' : 'Update Role'}
                            </button>
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
}

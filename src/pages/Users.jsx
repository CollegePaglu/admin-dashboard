import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { formatDate, formatPhoneNumber } from '../utils/formatters';
import './Users.css';

const PAGE_SIZE = 20;

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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    const fetchUsers = async (page = 1) => {
        setLoading(true);
        const { data, error } = await api.get(`/users?page=${page}&limit=${PAGE_SIZE}`);

        if (error) {
            toast.error('Failed to load users');
            console.error('Error loading users:', error);
        } else {
            console.log('[Users] API Response:', data);
            // data shape: { success, data: [...users], meta: { pagination } }
            const usersList = Array.isArray(data?.data) ? data.data :
                Array.isArray(data) ? data :
                    [];
            console.log('[Users] Extracted users:', usersList.length);
            setUsers(usersList);

            // Extract pagination from meta
            const pagination = data?.meta?.pagination;
            if (pagination) {
                setTotalUsers(pagination.total || 0);
                setTotalPages(pagination.totalPages || 1);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

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
            fetchUsers(currentPage);
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
            fetchUsers(currentPage);
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
            fetchUsers(currentPage);
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

    // Pagination helpers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Generate page numbers to display (show max 7 page buttons)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            let start = Math.max(2, currentPage - 2);
            let end = Math.min(totalPages - 1, currentPage + 2);

            // Adjust range so we always show 5 middle pages
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 5);
            }
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 4);
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    // Calculate the range of users being shown
    const startUser = (currentPage - 1) * PAGE_SIZE + 1;
    const endUser = Math.min(currentPage * PAGE_SIZE, totalUsers);

    return (
        <div className="page-container">
            <Sidebar active="users" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage all registered users on the platform</p>
                    </div>
                    <button className="btn-primary" onClick={() => fetchUsers(currentPage)}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <SearchBar
                        placeholder="Search users by name, email, or college..."
                        onSearch={setSearchTerm}
                    />
                    <div className="toolbar-stats">
                        <span>Total Users: <strong>{totalUsers}</strong></span>
                        {totalPages > 1 && (
                            <span className="page-indicator">
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    loading={loading}
                    emptyMessage="No users found"
                    onRowClick={handleRowClick}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing <strong>{startUser}</strong>–<strong>{endUser}</strong> of <strong>{totalUsers}</strong> users
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn pagination-nav"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                title="First Page"
                            >
                                ⏮
                            </button>
                            <button
                                className="pagination-btn pagination-nav"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                title="Previous Page"
                            >
                                ◀
                            </button>

                            {getPageNumbers().map((pageNum, idx) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        className={`pagination-btn ${currentPage === pageNum ? 'pagination-active' : ''}`}
                                        onClick={() => goToPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}

                            <button
                                className="pagination-btn pagination-nav"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                title="Next Page"
                            >
                                ▶
                            </button>
                            <button
                                className="pagination-btn pagination-nav"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Last Page"
                            >
                                ⏭
                            </button>
                        </div>
                    </div>
                )}

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

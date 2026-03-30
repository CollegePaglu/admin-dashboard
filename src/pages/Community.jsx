import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { ENDPOINTS, STATUS_COLORS } from '../config/constants';
import { formatDate, formatStatus, getInitials } from '../utils/formatters';
import './Community.css';

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function CommunityPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        // Try fetching all posts first for admin view
        const { data, error } = await api.get('/community/posts', { params: { limit: 100 } });

        if (error) {
            // Fallback: try pending posts endpoint
            const { data: pendingData, error: pendingError } = await api.get('/admin/posts/pending');
            if (pendingError) {
                toast.error('Failed to load posts');
                console.error('Error:', pendingError);
                setPosts([]);
            } else {
                const items = Array.isArray(pendingData) ? pendingData :
                    (pendingData?.data || pendingData?.posts || []);
                setPosts(items);
            }
        } else {
            const items = Array.isArray(data) ? data :
                (data?.data || data?.posts || []);
            setPosts(items);
        }
        setLoading(false);
    };

    const handleApprove = async (postId) => {
        const { error } = await api.post(`/admin/posts/${postId}/approve`);
        if (error) {
            toast.error('Failed to approve post');
        } else {
            toast.success('Post approved');
            setPosts(posts.map(p => p._id === postId ? { ...p, status: 'approved' } : p));
            setShowModal(false);
        }
    };

    const handleReject = async (postId) => {
        const { error } = await api.post(`/admin/posts/${postId}/reject`);
        if (error) {
            toast.error('Failed to reject post');
        } else {
            toast.success('Post rejected');
            setPosts(posts.filter(p => p._id !== postId));
            setShowModal(false);
        }
    };

    const openPostModal = (post) => {
        setSelectedPost(post);
        setShowModal(true);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || post.status === filter;
        return matchesSearch && matchesFilter;
    });

    const columns = [
        {
            key: 'author',
            label: 'Author',
            sortable: false,
            render: (author) => {
                if (!author) return 'Unknown';
                const displayName = author.displayName || author.name ||
                    (author.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : 'Unknown');
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {getInitials(displayName)}
                        </div>
                        <span className="font-medium">{displayName}</span>
                    </div>
                );
            }
        },
        {
            key: 'content',
            label: 'Content',
            render: (content) => (
                <div className="post-content-preview">
                    {content?.substring(0, 100) || 'No content'}{content?.length > 100 ? '...' : ''}
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (type) => (
                <span className="post-type-badge">{type || 'text'}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status || 'pending'} />
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (date) => formatDate(date)
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        className="btn-view-small"
                        onClick={(e) => { e.stopPropagation(); openPostModal(row); }}
                    >
                        👁️ View
                    </button>
                    {(row.status === 'pending' || !row.status) && (
                        <>
                            <button
                                className="btn-approve-small"
                                onClick={(e) => { e.stopPropagation(); handleApprove(row._id); }}
                            >
                                ✓
                            </button>
                            <button
                                className="btn-reject-small"
                                onClick={(e) => { e.stopPropagation(); handleReject(row._id); }}
                            >
                                ✗
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="page-container">
            <Sidebar active="community" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Community Management</h1>
                        <p>Moderate community posts and content</p>
                    </div>
                    <button className="btn-primary" onClick={fetchPosts}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <SearchBar
                        placeholder="Search by content or author..."
                        onSearch={setSearchTerm}
                    />
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                    </div>
                    <div className="toolbar-stats">
                        <span>Total Posts: <strong>{posts.length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredPosts}
                    loading={loading}
                    emptyMessage="No posts found"
                />

                {showModal && selectedPost && (
                    <Modal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        title="Post Details"
                    >
                        <div className="post-modal-content">
                            <div className="post-author-info">
                                <div className="author-avatar">
                                    {getInitials(selectedPost.author?.name || 'U')}
                                </div>
                                <div>
                                    <div className="author-name">{selectedPost.author?.name || 'Unknown'}</div>
                                    <div className="post-date">{formatDate(selectedPost.createdAt)}</div>
                                </div>
                            </div>
                            <div className="post-full-content">
                                {selectedPost.content || 'No content'}
                            </div>
                            {selectedPost.images?.length > 0 && (
                                <div className="post-images">
                                    {selectedPost.images.map((img, i) => (
                                        <img key={i} src={img} alt={`Post image ${i + 1}`} />
                                    ))}
                                </div>
                            )}
                            <div className="post-stats">
                                <span>❤️ {selectedPost.likeCount || 0} likes</span>
                                <span>💬 {selectedPost.commentCount || 0} comments</span>
                            </div>
                            {(selectedPost.status === 'pending' || !selectedPost.status) && (
                                <div className="post-modal-actions">
                                    <button className="btn-approve" onClick={() => handleApprove(selectedPost._id)}>
                                        ✓ Approve Post
                                    </button>
                                    <button className="btn-reject" onClick={() => handleReject(selectedPost._id)}>
                                        ✗ Reject Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
}

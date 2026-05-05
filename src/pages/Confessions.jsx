import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { formatDate } from '../utils/formatters';
import './Confessions.css';

// ─── Confession Detail Modal ─────────────────────────────────────────────────
function ConfessionModal({ confession, onClose, onDelete }) {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        if (!confession) return;
        let active = true;
        (async () => {
            setLoadingComments(true);
            const { data, error } = await api.get(`/community/posts/${confession._id}/comments`, { params: { limit: 50 } });
            if (active && !error && data?.data?.data) {
                setComments(data.data.data);
            }
            if (active) setLoadingComments(false);
        })();
        return () => { active = false; };
    }, [confession]);

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        const { error } = await api.delete(`/community/comments/${commentId}`);
        if (error) {
            toast.error('Failed to delete comment: ' + (error.message || 'Unknown error'));
        } else {
            toast.success('Comment deleted');
            setComments(prev => prev.filter(c => c._id !== commentId));
        }
    };

    if (!confession) return null;

    return (
        <div className="confession-modal-overlay" onClick={onClose}>
            <div className="confession-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="confession-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="confession-modal-avatar">🤫</div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>Anonymous Confession</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(confession.createdAt)}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="confession-modal-close">×</button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {confession.title && (
                        <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#1e293b' }}>{confession.title}</h3>
                    )}
                    <p style={{ color: '#475569', lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap', fontSize: 15 }}>
                        {confession.content}
                    </p>

                    {/* Stats */}
                    <div className="confession-modal-stats">
                        {[
                            ['👍', confession.upvotes ?? 0, 'Upvotes'],
                            ['👎', confession.downvotes ?? 0, 'Downvotes'],
                            ['💬', confession.commentCount ?? 0, 'Comments'],
                            ['👁', confession.viewCount ?? 0, 'Views'],
                        ].map(([icon, val, label]) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18 }}>{icon} <strong>{val}</strong></div>
                                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Comments Section */}
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
                            Comments ({confession.commentCount || 0})
                        </h4>
                        {loadingComments ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>
                                No comments yet.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                                {comments.map(c => (
                                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                                                {c.isAnonymous ? '🤫 Anonymous' : (c.author?.displayName || c.author?.name || 'Anonymous')}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{c.content}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteComment(c._id)}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 4 }}
                                            title="Delete Comment"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delete button */}
                    <div style={{ marginTop: 24 }}>
                        <button
                            onClick={() => onDelete(confession._id)}
                            className="confession-delete-btn"
                        >
                            🗑️ Delete This Confession
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ConfessionsPage() {
    const [confessions, setConfessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalConfessions, setTotalConfessions] = useState(0);
    const [selected, setSelected] = useState(null);
    const [deleting, setDeleting] = useState({});

    const LIMIT = 20;

    const fetchConfessions = async () => {
        setLoading(true);
        const params = { page, limit: LIMIT };
        if (search) params.search = search;

        const { data, error } = await api.get('/community/confessions', { params });
        if (error) {
            toast.error('Failed to load confessions');
        } else {
            const responseData = data?.data;
            let items = [];
            if (Array.isArray(responseData?.data)) {
                items = responseData.data;
            } else if (Array.isArray(responseData)) {
                items = responseData;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            }
            setConfessions(items);
            const pagination = responseData?.pagination || data?.pagination || data?.meta || {};
            setTotalConfessions(pagination.total ?? items.length);
            setTotalPages(pagination.totalPages ?? 1);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfessions();
    }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

    // Wrap search setter to also reset page
    const updateSearch = (val) => { setSearch(val); setPage(1); };

    const handleDelete = async (confessionId) => {
        if (!window.confirm('Permanently delete this confession? This cannot be undone.')) return;
        setDeleting(d => ({ ...d, [confessionId]: true }));
        const { error } = await api.delete(`/admin/posts/${confessionId}`);
        setDeleting(d => ({ ...d, [confessionId]: false }));
        if (error) {
            toast.error('Failed to delete confession: ' + (error.message || 'Unknown error'));
        } else {
            toast.success('Confession deleted successfully');
            setConfessions(prev => prev.filter(c => c._id !== confessionId));
            setTotalConfessions(t => t - 1);
            if (selected?._id === confessionId) setSelected(null);
        }
    };

    return (
        <div className="page-container">
            <Sidebar active="confessions" />
            <main className="main-content" style={{ paddingBottom: 40 }}>

                {/* Page Header */}
                <div className="page-header" style={{ marginBottom: 8 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#1e293b' }}>
                            🤫 Confessions Management
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                            View and moderate anonymous confessions
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => { setPage(1); fetchConfessions(); }}>
                        🔄 Refresh
                    </button>
                </div>

                {/* Stats strip */}
                <div className="confession-stats-strip">
                    {[
                        { label: 'Total Confessions', value: totalConfessions, icon: '🤫', color: '#8b5cf6' },
                        { label: 'This Page', value: confessions.length, icon: '📄', color: '#6366f1' },
                        { label: 'With Comments', value: confessions.filter(c => (c.commentCount ?? 0) > 0).length, icon: '💬', color: '#0ea5e9' },
                        { label: 'Most Upvoted', value: confessions.length > 0 ? Math.max(...confessions.map(c => c.upvotes ?? 0)) : 0, icon: '🔥', color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} className="confession-stat-card">
                            <div style={{ fontSize: 22 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="confession-toolbar">
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => updateSearch(e.target.value)}
                            placeholder="Search confessions…"
                            className="confession-search-input"
                        />
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                        Showing {confessions.length} of {totalConfessions}
                    </div>
                </div>

                {/* Confessions List */}
                {loading ? (
                    <div className="confession-empty-state">
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                        <div style={{ fontWeight: 600 }}>Loading confessions…</div>
                    </div>
                ) : confessions.length === 0 ? (
                    <div className="confession-empty-state" style={{ background: '#fff', border: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#64748b' }}>No confessions found</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search term</div>
                    </div>
                ) : (
                    <div className="confession-list">
                        {confessions.map(confession => {
                            const isDeleting = deleting[confession._id];

                            return (
                                <div key={confession._id} className="confession-card">
                                    {/* Left accent bar */}
                                    <div className="confession-card-accent" />

                                    <div className="confession-card-body">
                                        {/* Top row */}
                                        <div className="confession-card-top">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className="confession-anon-badge">🤫 Anonymous</span>
                                                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                                    {formatDate(confession.createdAt)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <span className="confession-stat-pill">
                                                    👍 {confession.upvotes ?? 0}
                                                </span>
                                                <span className="confession-stat-pill">
                                                    👎 {confession.downvotes ?? 0}
                                                </span>
                                                <span className="confession-stat-pill">
                                                    💬 {confession.commentCount ?? 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        {confession.title && (
                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 6 }}>
                                                {confession.title}
                                            </div>
                                        )}
                                        <p className="confession-card-content">
                                            {confession.content || 'No content'}
                                        </p>

                                        {/* Actions */}
                                        <div className="confession-card-actions">
                                            <button
                                                onClick={() => setSelected(confession)}
                                                className="confession-view-btn"
                                            >
                                                👁️ View Detail
                                            </button>
                                            <button
                                                onClick={() => handleDelete(confession._id)}
                                                disabled={isDeleting}
                                                className={`confession-del-btn ${isDeleting ? 'deleting' : ''}`}
                                            >
                                                {isDeleting ? '⏳ Deleting…' : '🗑️ Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="confession-pagination">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="confession-page-btn"
                        >
                            ← Prev
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', padding: '0 8px' }}>
                            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="confession-page-btn"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            {selected && (
                <ConfessionModal
                    confession={selected}
                    onClose={() => setSelected(null)}
                    onDelete={(id) => { handleDelete(id); setSelected(null); }}
                />
            )}
        </div>
    );
}

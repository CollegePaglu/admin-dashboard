import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { formatDate, getInitials } from '../utils/formatters';
import './Community.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normaliseImg = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://${url}`;
};

const AUTHOR_TYPES = ['All', 'User', 'CollegeSociety', 'Admin'];
const POST_TYPES   = ['All', 'text', 'image', 'video', 'poll', 'link', 'update'];

// ─── Type badge ──────────────────────────────────────────────────────────────
const TYPE_META = {
    text:    { color: '#6366f1', bg: '#eef2ff', emoji: '📝' },
    image:   { color: '#0ea5e9', bg: '#e0f2fe', emoji: '🖼️' },
    video:   { color: '#8b5cf6', bg: '#f3efff', emoji: '🎬' },
    poll:    { color: '#f59e0b', bg: '#fffbeb', emoji: '📊' },
    link:    { color: '#10b981', bg: '#ecfdf5', emoji: '🔗' },
    update:  { color: '#ef4444', bg: '#fef2f2', emoji: '📣' },
};

function TypeBadge({ type }) {
    const m = TYPE_META[type] || { color: '#6b7280', bg: '#f3f4f6', emoji: '❓' };
    return (
        <span style={{
            backgroundColor: m.bg, color: m.color,
            padding: '2px 10px', borderRadius: '9999px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em'
        }}>
            {m.emoji} {type?.toUpperCase() || 'TEXT'}
        </span>
    );
}

// ─── Author chip ─────────────────────────────────────────────────────────────
function AuthorChip({ author, authorType }) {
    const name = author?.displayName || author?.name ||
        (author?.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : '');
    const isSociety = authorType === 'CollegeSociety';
    const isAdmin   = authorType === 'Admin';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: isSociety ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : isAdmin ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                color: '#fff'
            }}>
                {getInitials(name || '?')}
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name || 'Unknown'}
                </div>
                <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: isSociety ? '#6366f1' : isAdmin ? '#ef4444' : '#0ea5e9'
                }}>
                    {isSociety ? '🏛 Society' : isAdmin ? '🛡 Admin' : '👤 User'}
                </div>
            </div>
        </div>
    );
}

// ─── Post Detail Modal ───────────────────────────────────────────────────────
function PostModal({ post, onClose, onDelete }) {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        if (!post) return;
        const fetchComments = async () => {
            setLoadingComments(true);
            const { data, error } = await api.get(`/community/posts/${post._id}/comments`, { params: { limit: 50 } });
            if (!error && data?.data?.data) {
                setComments(data.data.data);
            }
            setLoadingComments(false);
        };
        fetchComments();
    }, [post]);

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

    if (!post) return null;
    const images = (post.images || []).map(normaliseImg).filter(Boolean);
    const name   = post.author?.displayName || post.author?.name || 'Unknown';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth: 620,
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 700, color: '#fff'
                        }}>
                            {getInitials(name)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{name}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(post.createdAt)}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#f1f5f9', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b'
                    }}>×</button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {post.title && <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#1e293b' }}>{post.title}</h3>}
                    <p style={{ color: '#475569', lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                    {images.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: images.length === 1 ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            {images.map((img, i) => (
                                <img key={i} src={img} alt={`img-${i}`} style={{
                                    width: '100%', aspectRatio: '16/9', objectFit: 'cover',
                                    borderRadius: 12, border: '1px solid #e2e8f0'
                                }} onError={e => { e.target.style.display = 'none'; }} />
                            ))}
                        </div>
                    )}

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 20 }}>
                        {[['👍', post.upvotes ?? post.likeCount ?? 0, 'Upvotes'],
                          ['👎', post.downvotes ?? 0, 'Downvotes'],
                          ['💬', post.commentCount ?? 0, 'Comments'],
                          ['👁', post.viewCount ?? 0, 'Views']
                        ].map(([icon, val, label]) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18 }}>{icon} <strong>{val}</strong></div>
                                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Badge row */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                        <TypeBadge type={post.type} />
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                            📡 {post.authorType || 'User'}
                        </span>
                        {post.category && (
                            <span style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>
                                🏷 {post.category}
                            </span>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>Comments ({post.commentCount || 0})</h4>
                        {loadingComments ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>No comments yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                                {comments.map(c => (
                                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{c.author?.displayName || c.author?.name || 'Anonymous'}</div>
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
                            onClick={() => onDelete(post._id)}
                            style={{
                                width: '100%', padding: '12px 20px', borderRadius: 12,
                                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                                color: '#fff', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 14, letterSpacing: '0.04em',
                                boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                            }}
                        >
                            🗑️ Delete This Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
    const [posts, setPosts]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [authorFilter, setAuthorFilter] = useState('All');
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [selected, setSelected]     = useState(null);
    const [deleting, setDeleting]     = useState({});
    const [sortBy, setSortBy]         = useState('recent');

    const LIMIT = 20;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const params = { page, limit: LIMIT, sortBy, includeUpdates: true };
        if (search) params.search = search;
        if (typeFilter !== 'All') params.type = typeFilter;

        const { data, error } = await api.get('/community/posts', { params });
        if (error) {
            toast.error('Failed to load posts');
        } else {
            // API: { success, data: [...], meta: { total, page, totalPages } }
            let items = Array.isArray(data?.data) ? data.data : (data?.posts || data || []);
            // Filter by author type client-side if needed
            if (authorFilter !== 'All') {
                items = items.filter(p => p.authorType === authorFilter);
            }
            setPosts(items);
            setTotalPosts(data?.meta?.total ?? data?.pagination?.total ?? items.length);
            setTotalPages(data?.meta?.totalPages ?? data?.pagination?.totalPages ?? 1);
        }
        setLoading(false);
    }, [page, search, typeFilter, authorFilter, sortBy]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1); }, [search, typeFilter, authorFilter, sortBy]);

    const handleDelete = async (postId) => {
        if (!window.confirm('Permanently delete this post? This cannot be undone.')) return;
        setDeleting(d => ({ ...d, [postId]: true }));
        const { error } = await api.delete(`/community/posts/${postId}`);
        setDeleting(d => ({ ...d, [postId]: false }));
        if (error) {
            toast.error('Failed to delete post: ' + (error.message || 'Unknown error'));
        } else {
            toast.success('Post deleted successfully');
            setPosts(prev => prev.filter(p => p._id !== postId));
            setTotalPosts(t => t - 1);
            if (selected?._id === postId) setSelected(null);
        }
    };

    const getAuthorName = (post) => {
        const a = post.author;
        return a?.displayName || a?.name || (a?.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : '');
    };

    return (
        <div className="page-container">
            <Sidebar active="community" />
            <main className="main-content" style={{ paddingBottom: 40 }}>

                {/* Page Header */}
                <div className="page-header" style={{ marginBottom: 8 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#1e293b' }}>
                            🗂️ Posts Management
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                            View and moderate all user, society, and admin posts
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => { setPage(1); fetchPosts(); }}>
                        🔄 Refresh
                    </button>
                </div>

                {/* Stats strip */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Posts', value: totalPosts, icon: '📝', color: '#6366f1' },
                        { label: 'User Posts', value: posts.filter(p => !p.authorType || p.authorType === 'User').length, icon: '👤', color: '#0ea5e9' },
                        { label: 'Society Posts', value: posts.filter(p => p.authorType === 'CollegeSociety').length, icon: '🏛', color: '#8b5cf6' },
                        { label: 'With Images', value: posts.filter(p => p.images?.length > 0).length, icon: '🖼️', color: '#10b981' },
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: '1 1 160px', padding: '14px 18px', borderRadius: 14,
                            background: '#fff', border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: 22 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{
                    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
                    padding: '14px 18px', background: '#fff', borderRadius: 14,
                    border: '1px solid #e2e8f0', marginBottom: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 220px' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search content, title, author…"
                            style={{
                                width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10,
                                border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
                                background: '#f8fafc', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Author type filter */}
                    <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer' }}>
                        {AUTHOR_TYPES.map(a => <option key={a}>{a === 'CollegeSociety' ? 'Society' : a}</option>)}
                    </select>

                    {/* Post type filter */}
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer' }}>
                        {POST_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>

                    {/* Sort */}
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer' }}>
                        <option value="recent">🕐 Recent</option>
                        <option value="trending">🔥 Trending</option>
                        <option value="top">⭐ Top</option>
                    </select>
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                        <div style={{ fontWeight: 600 }}>Loading posts…</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#64748b' }}>No posts found</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search term</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {posts.map(post => {
                            const coverImg = normaliseImg(post.images?.[0]);
                            const authorName = getAuthorName(post);
                            const isDeleting = deleting[post._id];

                            return (
                                <div key={post._id} style={{
                                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                                    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                                >
                                    {/* Cover Image */}
                                    {coverImg ? (
                                        <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#f1f5f9' }}>
                                            <img src={coverImg} alt="cover"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={e => { e.target.parentElement.style.display = 'none'; }} />
                                            <div style={{
                                                position: 'absolute', bottom: 8, right: 8
                                            }}>
                                                <TypeBadge type={post.type} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            height: 60, background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
                                            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10
                                        }}>
                                            <TypeBadge type={post.type} />
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {post.title && (
                                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 6, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.title}
                                            </div>
                                        )}
                                        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                                            {post.content || 'No content'}
                                        </p>

                                        <AuthorChip author={post.author} authorType={post.authorType} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                👍 {post.upvotes ?? 0} &nbsp;💬 {post.commentCount ?? 0} &nbsp;📅 {formatDate(post.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
                                        <button
                                            onClick={() => setSelected(post)}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                                background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#475569'
                                            }}
                                        >
                                            👁️ View Detail
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            disabled={isDeleting}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: 10, border: 'none',
                                                background: isDeleting ? '#fca5a5' : '#fee2e2',
                                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                                fontSize: 12, fontWeight: 700, color: '#dc2626'
                                            }}
                                        >
                                            {isDeleting ? '⏳ Deleting…' : '🗑️ Delete'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 28 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}>
                            ← Prev
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', padding: '0 8px' }}>
                            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}>
                            Next →
                        </button>
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            {selected && (
                <PostModal
                    post={selected}
                    onClose={() => setSelected(null)}
                    onDelete={(id) => { handleDelete(id); setSelected(null); }}
                />
            )}
        </div>
    );
}

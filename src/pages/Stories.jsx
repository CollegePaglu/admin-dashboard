import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import './Stories.css';

// ============================================
// STORIES PAGE - Admin Management
// ============================================

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await api.get('/community/stories/feed', { params: { limit: 50 } });
            if (apiError) throw new Error(apiError.message);

            // Flatten the feed data - stories are grouped by user
            const allStories = [];
            const feedData = data?.data || data || [];

            if (Array.isArray(feedData)) {
                feedData.forEach(userGroup => {
                    if (userGroup.stories && Array.isArray(userGroup.stories)) {
                        userGroup.stories.forEach(story => {
                            allStories.push({
                                ...story,
                                author: userGroup.author || story.author
                            });
                        });
                    } else if (userGroup._id) {
                        allStories.push(userGroup);
                    }
                });
            }

            setStories(allStories);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load stories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (storyId) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return;

        try {
            const { error: apiError } = await api.delete(`/community/stories/${storyId}`);
            if (apiError) throw new Error(apiError.message);

            setStories(prev => prev.filter(s => s._id !== storyId));
            toast.success('Story deleted successfully');
            setShowPreview(false);
        } catch (err) {
            toast.error('Failed to delete story: ' + err.message);
        }
    };

    const openPreview = (story) => {
        setSelectedStory(story);
        setShowPreview(true);
    };

    // Filter stories
    const filteredStories = stories.filter(story => {
        const matchesFilter = filter === 'all' || story.type === filter;
        const matchesSearch =
            (story.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (story.textContent || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStoryTypeIcon = (type) => {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎬';
            case 'text': return '📝';
            default: return '📸';
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="page-container">
            <Sidebar active="stories" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Stories Management</h1>
                        <p>View and moderate user stories</p>
                    </div>
                    <button className="btn-secondary" onClick={fetchStories}>
                        🔄 Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="stories-toolbar">
                    <div className="stories-filters">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({stories.length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
                            onClick={() => setFilter('image')}
                        >
                            🖼️ Images
                        </button>
                        <button
                            className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
                            onClick={() => setFilter('video')}
                        >
                            🎬 Videos
                        </button>
                        <button
                            className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
                            onClick={() => setFilter('text')}
                        >
                            📝 Text
                        </button>
                    </div>
                    <div className="stories-search">
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading stories...</p>
                    </div>
                ) : error ? (
                    <div className="error-state glass">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={fetchStories}>
                            Retry
                        </button>
                    </div>
                ) : filteredStories.length === 0 ? (
                    <div className="empty-state glass">
                        <span className="empty-icon">📸</span>
                        <h3>No Stories Found</h3>
                        <p>
                            {searchTerm || filter !== 'all'
                                ? 'Try adjusting your filters or search term'
                                : 'No stories have been posted yet'}
                        </p>
                    </div>
                ) : (
                    <div className="stories-grid">
                        {filteredStories.map(story => (
                            <div
                                key={story._id}
                                className="story-card glass"
                                onClick={() => openPreview(story)}
                            >
                                <div className="story-preview">
                                    {story.type === 'image' && story.mediaUrl ? (
                                        <img src={story.mediaUrl} alt="Story" />
                                    ) : story.type === 'video' && story.mediaUrl ? (
                                        <video src={story.mediaUrl} />
                                    ) : (
                                        <div
                                            className="story-text-preview"
                                            style={{ backgroundColor: story.backgroundColor || '#6366f1' }}
                                        >
                                            <p>{story.textContent?.substring(0, 100) || 'Text Story'}</p>
                                        </div>
                                    )}
                                    <div className="story-type-badge">
                                        {getStoryTypeIcon(story.type)}
                                    </div>
                                </div>
                                <div className="story-info">
                                    <div className="story-author">
                                        <div className="author-avatar">
                                            {story.author?.profilePicture ? (
                                                <img src={story.author.profilePicture} alt="" />
                                            ) : (
                                                <span>{story.author?.name?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div className="author-details">
                                            <span className="author-name">{story.author?.name || 'Unknown'}</span>
                                            <span className="story-time">{formatTimeAgo(story.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="story-stats">
                                        <span>👁️ {story.viewCount || 0}</span>
                                        <span>❤️ {story.likeCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview Modal */}
                {showPreview && selectedStory && (
                    <Modal
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                        title="Story Details"
                    >
                        <div className="story-modal-content">
                            <div className="story-modal-preview">
                                {selectedStory.type === 'image' && selectedStory.mediaUrl ? (
                                    <img src={selectedStory.mediaUrl} alt="Story" />
                                ) : selectedStory.type === 'video' && selectedStory.mediaUrl ? (
                                    <video src={selectedStory.mediaUrl} controls />
                                ) : (
                                    <div
                                        className="story-text-full"
                                        style={{ backgroundColor: selectedStory.backgroundColor || '#6366f1' }}
                                    >
                                        <p>{selectedStory.textContent}</p>
                                    </div>
                                )}
                            </div>
                            <div className="story-modal-info">
                                <div className="info-row">
                                    <span className="info-label">Author</span>
                                    <span className="info-value">{selectedStory.author?.name || 'Unknown'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Type</span>
                                    <span className="info-value">{getStoryTypeIcon(selectedStory.type)} {selectedStory.type}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Views</span>
                                    <span className="info-value">{selectedStory.viewCount || 0}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Likes</span>
                                    <span className="info-value">{selectedStory.likeCount || 0}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Created</span>
                                    <span className="info-value">{new Date(selectedStory.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Expires</span>
                                    <span className="info-value">{new Date(selectedStory.expiresAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="story-modal-actions">
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDelete(selectedStory._id)}
                                >
                                    🗑️ Delete Story
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowPreview(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
};

export default Stories;

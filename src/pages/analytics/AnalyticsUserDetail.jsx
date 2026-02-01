import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatDate } from '../../utils/formatters';

const AnalyticsUserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('journey'); // journey | recommendations

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const { data: response } = await api.analytics.getUserDetail(id);
                if (response?.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading user details...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">User not found</div>;

    const { analytics, recentActivity, recommendations } = data;
    const { userId: user } = analytics;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate('/analytics')}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
            >
                ← Back to Analytics
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                        {user.name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <div className="text-gray-500">{user.email} • Joined {formatDate(user.createdAt)}</div>
                        <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                                {analytics.funnelState?.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {analytics.totalSessions} Sessions
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Engagement Score</div>
                    <div className="text-3xl font-bold text-blue-600">{Math.round(analytics.engagementScore)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('journey')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'journey'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    User Journey
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'recommendations'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Recommendations AI
                </button>
            </div>

            {/* Content */}
            {activeTab === 'journey' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((event) => (
                                <div key={event._id} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0">
                                    <div className="mt-1 text-xl">{getActionIcon(event.action)}</div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatActionText(event)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(event.createdAt)} • {event.metadata?.device}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold mb-4">Feature Usage</h3>
                            <div className="space-y-3">
                                <StatRow label="Posts Viewed" value={analytics.activity.postsViewed} />
                                <StatRow label="Posts Liked" value={analytics.activity.postsLiked} />
                                <StatRow label="Societies Joined" value={analytics.activity.societiesJoined} />
                                <StatRow label="Orders Placed" value={analytics.activity.ordersPlaced} />
                                <StatRow label="Total Spend" value={`₹${analytics.activity.totalSpend}`} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recommended Societies */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-4">Recommended Societies</h3>
                        <div className="space-y-4">
                            {recommendations.societies.map((item) => (
                                <RecommendationCard key={item.entityId} item={item} type="society" />
                            ))}
                            {recommendations.societies.length === 0 && <div className="text-gray-500 italic">No society recommendations available.</div>}
                        </div>
                    </div>

                    {/* Recommended Posts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-4">Recommended Posts</h3>
                        <div className="space-y-4">
                            {recommendations.posts.map((item) => (
                                <RecommendationCard key={item.entityId} item={item} type="post" />
                            ))}
                            {recommendations.posts.length === 0 && <div className="text-gray-500 italic">No post recommendations available.</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);

const RecommendationCard = ({ item, type }) => (
    <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-start mb-2">
            <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{type}</span>
                <div className="font-semibold text-gray-900">ID: {item.entityId.substring(0, 8)}...</div>
            </div>
            <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                {item.confidence}% Match
            </div>
        </div>

        <div className="space-y-1 mt-3">
            {item.signals.map((signal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <span>✨</span>
                    <span>{signal.description}</span>
                </div>
            ))}
        </div>
    </div>
);

const getActionIcon = (action) => {
    const map = {
        view: '👀', click: '👆', join: '🤝', like: '❤️',
        comment: '💬', share: '🚀', purchase: '💰',
        session_start: '🏁', session_end: '🛑'
    };
    return map[action] || '⚡';
};

const formatActionText = (event) => {
    switch (event.action) {
        case 'view': return `Viewed ${event.entityType}`;
        case 'click': return `Clicked on ${event.entityType}`;
        case 'session_start': return 'Started a session';
        case 'purchase': return 'Made a purchase';
        default: return `${event.action} ${event.entityType}`;
    }
};

export default AnalyticsUserDetail;

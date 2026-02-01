import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatDate } from '../../utils/formatters';

const AnalyticsSocietyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const { data: response } = await api.analytics.getSocietyDetail(id);
                if (response?.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch society details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading society analytics...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Society analytics not found</div>;

    const { analytics, topPosts } = data;
    const { societyId: society } = analytics;

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
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {society.avatar ? (
                            <img src={society.avatar} alt={society.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-gray-600">{society.name?.[0]}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{society.name}</h1>
                        <div className="text-gray-500">{society.email}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Health Score</div>
                    <div className="text-3xl font-bold text-green-600">{Math.round(analytics.healthScore)}</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Stats Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-4">Membership</h3>
                        <div className="space-y-4">
                            <StatTile label="Total Members" value={analytics.totalMembers} subtext={`${analytics.memberGrowthRate > 0 ? '+' : ''}${analytics.memberGrowthRate}% growth (30d)`} />
                            <StatTile label="Active (7d)" value={analytics.activeMembers7d} />
                            <StatTile label="Active (30d)" value={analytics.activeMembers30d} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-4">Engagement</h3>
                        <div className="space-y-4">
                            <StatTile label="Total Posts" value={analytics.totalPosts} />
                            <StatTile label="Avg Engagement" value={analytics.avgPostEngagement.toFixed(1)} subtext="per post" />
                            <StatTile label="Recruited via Recs" value={analytics.joinsFromRecommendations} subtext="from recommendations" />
                        </div>
                    </div>
                </div>

                {/* Content Performance */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold mb-4">Top Performing Posts</h3>
                    <div className="space-y-4">
                        {topPosts.length > 0 ? (
                            topPosts.map(post => (
                                <div key={post._id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-gray-900 line-clamp-1">{post.postId?.title || 'Untitled Post'}</div>
                                        <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>🔥 {Math.round(post.hotnessScore)} Hotness</span>
                                        <span>👀 {post.impressions} Views</span>
                                        <span>❤️ {post.likes} Likes</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">No posts found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatTile = ({ label, value, subtext }) => (
    <div>
        <div className="text-gray-500 text-xs uppercase tracking-wider">{label}</div>
        <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subtext && <div className="text-xs text-green-600">{subtext}</div>}
        </div>
    </div>
);

export default AnalyticsSocietyDetail;

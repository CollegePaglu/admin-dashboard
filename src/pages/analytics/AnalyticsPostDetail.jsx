import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const AnalyticsPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const { data, error: apiError } = await api.analytics.getPostDetail(id);
                if (apiError) throw new Error(apiError.message || 'Failed to fetch details');
                setDetail(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [id]);

    if (loading) return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar active="analytics" />
            <main className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </main>
        </div>
    );

    if (error || !detail) return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar active="analytics" />
            <main className="flex-1 p-8">
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">Error: {error || 'Not found'}</div>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">← Back</button>
            </main>
        </div>
    );

    const { analytics, engagementTimeline } = detail;
    const post = analytics?.postId || {};

    const formattedTimeline = engagementTimeline.map(item => ({
        date: item._id?.date,
        interactions: item.count || 0
    }));

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar active="analytics" />
            
            <main className="flex-1 overflow-y-auto w-full">
                <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Post Deep Dive</h1>
                            <p className="text-gray-500 text-sm">Detailed performance & engagement</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Post Preview Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Content Block</h3>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">{post.title || 'Untitled'}</h4>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.content || 'No content available.'}</p>
                                    
                                    {post.images && post.images.length > 0 && (
                                        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={post.images[0]} alt="Post media" className="w-full h-48 object-cover" />
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-500">
                                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-purple-600">Type: {post.type || 'Standard'}</span>
                                        <span>Created: {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-md p-6 text-white">
                                <div className="text-orange-100 text-sm font-medium mb-1">Hotness Score</div>
                                <div className="text-5xl font-extrabold flex items-center gap-2">
                                    {Math.round(analytics.hotnessScore)} <span className="text-3xl">🔥</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats & Timeline */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard icon="❤️" label="Total Likes" value={analytics.likes} />
                                <MetricCard icon="💬" label="Comments" value={analytics.comments} />
                                <MetricCard icon="🚀" label="Shares" value={analytics.shares} />
                                <MetricCard icon="👀" label="Impressions" value={analytics.impressions} />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium">Engagement Rate</h4>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.engagementRate?.toFixed(2)}%</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-gray-500 text-sm font-medium">Est. Unique Viewers</h4>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.uniqueViewers?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Interactions Timeline */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 box-border overflow-hidden min-h-[400px]">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 w-full shrink-0">Interaction Timeline (Last 7 Days)</h3>
                                {formattedTimeline.length > 0 ? (
                                    <div className="h-72 w-full pt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={formattedTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }}
                                                />
                                                <Area type="monotone" dataKey="interactions" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorInteractions)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                                        No recent interaction data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const MetricCard = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
);

export default AnalyticsPostDetail;

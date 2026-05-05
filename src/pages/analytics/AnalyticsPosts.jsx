import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/formatters';

const AnalyticsPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState({ by: 'hotnessScore', order: 'desc' });
    const { page, limit, setTotal, paginationProps } = usePagination({ initialLimit: 10 });

    useEffect(() => {
        fetchPosts();
    }, [page, limit, sort]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.analytics.getPosts({
                page,
                limit,
                sortBy: sort.by,
                sortOrder: sort.order,
            });
            if (data?.success) {
                setPosts(data.data.posts || []);
                setTotal(data.data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch post analytics:', error);
            setTotal(0); // Fix NaN bug
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        setSort(prev => ({
            by: field,
            order: prev.by === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const columns = [
        {
            header: 'Post',
            accessor: 'title',
            render: (post) => (
                <div className="max-w-md py-1">
                    <div className="font-semibold text-gray-900 truncate text-[14px]">{post.postId?.title || 'Untitled Post'}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 font-medium">{post.postId?.content || 'Media Post'}</div>
                    <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                        {formatDate(post.createdAt)} &bull; {post.postId?.type || 'STANDARD'}
                    </div>
                </div>
            )
        },
        {
            header: 'Hotness',
            accessor: 'hotnessScore',
            render: (post) => (
                <div className="w-full max-w-[100px]">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-gray-700">🔥 {Math.round(post.hotnessScore || 0)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${(post.hotnessScore || 0) > 50 ? 'bg-orange-500' : 'bg-yellow-400'
                                }`}
                            style={{ width: `${Math.min((post.hotnessScore || 0), 100)}%` }}
                        ></div>
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('hotnessScore')
        },
        {
            header: 'Engagement',
            render: (post) => (
                <div className="flex gap-3 text-sm text-gray-600 font-medium">
                    <span title="Likes" className="flex items-center gap-1"><span className="text-red-400">❤️</span> {post.likes || 0}</span>
                    <span title="Comments" className="flex items-center gap-1"><span className="text-gray-400">💬</span> {post.comments || 0}</span>
                    <span title="Shares" className="flex items-center gap-1"><span className="text-[var(--brand-500)]">🚀</span> {post.shares || 0}</span>
                </div>
            )
        },
        {
            header: 'Reach',
            render: (post) => (
                <div className="text-sm">
                    <div className="font-semibold text-gray-800 tracking-tight">👀 {post.impressions || 0}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase mt-0.5">
                        {(post.engagementRate || 0).toFixed(1)}% Eng. Rate
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('impressions')
        },
        {
            header: '',
            render: (post) => (
                <a 
                    href={`/analytics/posts/${post.postId?._id}`}
                    className="text-[var(--brand-500)] hover:text-[var(--brand-700)] text-sm font-semibold transition-colors whitespace-nowrap"
                >
                    Details &rarr;
                </a>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Community Posts</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={posts}
                    loading={loading}
                    emptyMessage="No posts found matching the criteria."
                />
                {!loading && (
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <Pagination {...paginationProps} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPosts;

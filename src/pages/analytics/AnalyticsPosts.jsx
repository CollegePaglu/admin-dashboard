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
    const { page, limit, setPage, setTotal, paginationProps } = usePagination({ initialLimit: 10 });

    useEffect(() => {
        fetchPosts();
    }, [page, limit, sort]);

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
                setPosts(data.data.posts);
                setTotal(data.data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch post analytics:', error);
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
                <div className="max-w-md">
                    <div className="font-medium text-gray-900 truncate">{post.postId?.title || 'Untitled Post'}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{post.postId?.content}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {formatDate(post.createdAt)} • {post.postId?.type}
                    </div>
                </div>
            )
        },
        {
            header: 'Hotness',
            accessor: 'hotnessScore',
            render: (post) => (
                <div className="w-full max-w-[100px]">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-orange-600">🔥 {Math.round(post.hotnessScore)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${post.hotnessScore > 50 ? 'bg-orange-500' : 'bg-yellow-400'
                                }`}
                            style={{ width: `${Math.min(post.hotnessScore, 100)}%` }}
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
                <div className="flex gap-3 text-sm text-gray-600">
                    <span title="Likes">❤️ {post.likes}</span>
                    <span title="Comments">💬 {post.comments}</span>
                    <span title="Shares">🚀 {post.shares}</span>
                </div>
            )
        },
        {
            header: 'Reach',
            render: (post) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">👀 {post.impressions}</div>
                    <div className="text-xs text-gray-500">
                        {post.engagementRate.toFixed(1)}% Eng. Rate
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('impressions')
        },
        // {
        //     header: 'Action',
        //     render: (post) => (
        //         <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        //             View
        //         </button>
        //     )
        // }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Post Analytics</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={posts}
                    loading={loading}
                    emptyMessage="No post analytics found."
                />
                {!loading && (
                    <div className="p-4 border-t border-gray-100">
                        <Pagination {...paginationProps} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPosts;

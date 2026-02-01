import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';

const AnalyticsUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState({ by: 'engagementScore', order: 'desc' });
    const { page, limit, setPage, setTotal, paginationProps } = usePagination({ initialLimit: 10 });

    useEffect(() => {
        fetchUsers();
    }, [page, limit, sort]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.analytics.getUsers({
                page,
                limit,
                sortBy: sort.by,
                sortOrder: sort.order,
            });
            if (data?.success) {
                setUsers(data.data.users);
                setTotal(data.data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
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
            header: 'User',
            accessor: 'user',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{user.userId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{user.userId?.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Engagement Score',
            accessor: 'engagementScore',
            render: (user) => (
                <div className="w-full max-w-[140px]">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{Math.round(user.engagementScore)}</span>
                        <span className={user.engagementTrend === 'up' ? 'text-green-500' : 'text-gray-400'}>
                            {user.engagementTrend === 'up' ? 'Testing ↑' : user.engagementTrend === 'down' ? '↓' : '•'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${user.engagementScore > 75 ? 'bg-green-500' :
                                    user.engagementScore > 40 ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            style={{ width: `${user.engagementScore}%` }}
                        ></div>
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('engagementScore')
        },
        {
            header: 'Funnel State',
            accessor: 'funnelState',
            render: (user) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.funnelState === 'power_user' ? 'bg-purple-100 text-purple-700' :
                        user.funnelState === 'activated' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                    }`}>
                    {user.funnelState?.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Features Used',
            render: (user) => (
                <div className="flex gap-2 text-xs text-gray-500">
                    <span title="Posts Viewed">👁️ {user.activity?.postsViewed || 0}</span>
                    <span title="Orders Placed">📦 {user.activity?.ordersPlaced || 0}</span>
                </div>
            )
        },
        {
            header: 'Last Active',
            accessor: 'lastActiveAt',
            render: (user) => (
                <span className="text-sm text-gray-500">
                    {new Date(user.lastActiveAt).toLocaleDateString()}
                </span>
            ),
            sortable: true,
            onSort: () => handleSort('lastActiveAt')
        },
        {
            header: '',
            render: (user) => (
                <a
                    href={`/analytics/users/${user.userId?._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View Details →
                </a>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">User Analytics</h3>
                {/* Add filters here later */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="No user analytics found."
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

export default AnalyticsUsers;

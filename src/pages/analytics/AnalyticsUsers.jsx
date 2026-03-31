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
                setUsers(data.data.users || []);
                setTotal(data.data.pagination?.total || 0); // Fix NaN bug
            }
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
            setTotal(0); // Safely reset the total
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
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-sm font-bold text-green-700 border border-green-200 shadow-sm">
                        {user.userId?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 text-[14px]">{user.userId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 font-medium">{user.userId?.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Engagement Score',
            accessor: 'engagementScore',
            render: (user) => (
                <div className="w-full max-w-[140px]">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-700">{Math.round(user.engagementScore || 0)}/100</span>
                        <span className={user.engagementTrend === 'up' ? 'text-green-600 font-bold' : 'text-gray-400'}>
                            {user.engagementTrend === 'up' ? '↑' : user.engagementTrend === 'down' ? '↓' : '•'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${user.engagementScore > 75 ? 'bg-[var(--brand-500)]' :
                                    user.engagementScore > 40 ? 'bg-[var(--brand-300)]' : 'bg-gray-400'
                                }`}
                            style={{ width: `${Math.min(100, Math.max(0, user.engagementScore || 0))}%` }}
                        ></div>
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('engagementScore')
        },
        {
            header: 'Phase',
            accessor: 'funnelState',
            render: (user) => {
                const state = user.funnelState || 'registered';
                const styleMap = {
                    power_user: 'bg-green-100 text-green-800 border-green-200',
                    activated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    onboarded: 'bg-teal-50 text-teal-700 border-teal-200',
                    registered: 'bg-gray-50 text-gray-600 border-gray-200'
                };
                
                return (
                    <span className={`px-2.5 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${styleMap[state] || styleMap.registered}`}>
                        {state.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: 'Activity',
            render: (user) => (
                <div className="flex gap-3 text-xs text-gray-600 font-medium">
                    <span title="Posts Viewed" className="flex items-center gap-1"><span className="text-gray-400">👁</span> {user.activity?.postsViewed || 0}</span>
                    <span title="Orders Placed" className="flex items-center gap-1"><span className="text-green-500">🛍</span> {user.activity?.ordersPlaced || 0}</span>
                </div>
            )
        },
        {
            header: 'Last Seen',
            accessor: 'lastActiveAt',
            render: (user) => (
                <span className="text-sm text-gray-500 font-medium">
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A'}
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
                    className="text-[var(--brand-500)] hover:text-[var(--brand-700)] text-sm font-semibold transition-colors"
                >
                    Details &rarr;
                </a>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Active Analysts & Users</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="No active users found for the selected criteria."
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

export default AnalyticsUsers;

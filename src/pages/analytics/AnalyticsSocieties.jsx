import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';

const AnalyticsSocieties = () => {
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState({ by: 'healthScore', order: 'desc' });
    const { page, limit, setPage, setTotal, paginationProps } = usePagination({ initialLimit: 10 });

    useEffect(() => {
        fetchSocieties();
    }, [page, limit, sort]);

    const fetchSocieties = async () => {
        setLoading(true);
        try {
            const { data } = await api.analytics.getSocieties({
                page,
                limit,
                sortBy: sort.by,
                sortOrder: sort.order,
            });
            if (data?.success) {
                setSocieties(data.data.societies);
                setTotal(data.data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch society analytics:', error);
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
            header: 'Society',
            accessor: 'society',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {item.societyId?.avatar ? (
                            <img src={item.societyId.avatar} alt={item.societyId.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-gray-600">{item.societyId?.name?.[0]}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{item.societyId?.name || 'Unknown Society'}</div>
                        <div className="text-xs text-gray-500 overflow-hidden text-ellipsis w-48 whitespace-nowrap">
                            {item.societyId?.bio || 'No bio'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Health Score',
            accessor: 'healthScore',
            render: (item) => (
                <div className="w-full max-w-[120px]">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{Math.round(item.healthScore)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${item.healthScore > 70 ? 'bg-green-500' :
                                    item.healthScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${item.healthScore}%` }}
                        ></div>
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('healthScore')
        },
        {
            header: 'Members',
            accessor: 'totalMembers',
            render: (item) => (
                <div>
                    <div className="font-medium">{item.totalMembers}</div>
                    <div className={`text-xs ${item.memberGrowthRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {item.memberGrowthRate > 0 ? '+' : ''}{item.memberGrowthRate}%
                    </div>
                </div>
            ),
            sortable: true,
            onSort: () => handleSort('totalMembers')
        },
        {
            header: 'Engagement',
            accessor: 'avgPostEngagement',
            render: (item) => (
                <div className="text-sm">
                    {item.avgPostEngagement.toFixed(1)} <span className="text-gray-400 text-xs">avg/post</span>
                </div>
            )
        },
        {
            header: 'Action',
            render: (item) => (
                <a
                    href={`/analytics/societies/${item.societyId._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View →
                </a>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Society Analytics</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={societies}
                    loading={loading}
                    emptyMessage="No society analytics found."
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

export default AnalyticsSocieties;

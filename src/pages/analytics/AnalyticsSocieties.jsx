import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';

const AnalyticsSocieties = () => {
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState({ by: 'healthScore', order: 'desc' });
    const { page, limit, setTotal, paginationProps } = usePagination({ initialLimit: 10 });

    useEffect(() => {
        fetchSocieties();
    }, [page, limit, sort]); // eslint-disable-line react-hooks/exhaustive-deps

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
                setSocieties(data.data.societies || []);
                setTotal(data.data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch society analytics:', error);
            setTotal(0); // NaN fix
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
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border border-green-200">
                        {item.societyId?.avatar ? (
                            <img src={item.societyId.avatar} alt={item.societyId.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-green-700">{item.societyId?.name?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 text-[14px]">{item.societyId?.name || 'Unknown Society'}</div>
                        <div className="text-xs text-gray-500 overflow-hidden text-ellipsis w-48 whitespace-nowrap font-medium">
                            {item.societyId?.bio || 'College community'}
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
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-700">{Math.round(item.healthScore || 0)}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${item.healthScore > 70 ? 'bg-[var(--brand-500)]' :
                                    item.healthScore > 40 ? 'bg-[var(--brand-300)]' : 'bg-red-400'
                                }`}
                            style={{ width: `${Math.min(100, Math.max(0, item.healthScore || 0))}%` }}
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
                    <div className="font-semibold text-gray-800">{item.totalMembers || 0}</div>
                    <div className={`text-xs font-bold mt-0.5 ${item.memberGrowthRate >= 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.memberGrowthRate > 0 ? '↑' : ''}{item.memberGrowthRate || 0}%
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
                <div className="text-sm font-semibold text-gray-700">
                    {(item.avgPostEngagement || 0).toFixed(1)} <span className="text-gray-400 font-medium text-xs">avg/post</span>
                </div>
            )
        },
        {
            header: '',
            render: (item) => (
                <a
                    href={`/analytics/societies/${item.societyId?._id}`}
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
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Society Performance</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={societies}
                    loading={loading}
                    emptyMessage="No robust society analytics found for criteria."
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

export default AnalyticsSocieties;

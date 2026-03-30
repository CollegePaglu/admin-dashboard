import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import AssignAlphaModal from '../components/AssignAlphaModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../api/client';
import { ENDPOINTS, ASSIGNMENT_STATUS, STATUS_COLORS } from '../config/constants';
import { formatCurrency, formatDate, formatStatus, getInitials } from '../utils/formatters';
import './Orders.css'; // Reusing Orders CSS for consistency

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#6b7280';
    return (
        <span className="status-badge" style={{ backgroundColor: color }}>
            {formatStatus(status)}
        </span>
    );
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, assignment: null });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        // Fetching with a higher limit to show more assignments initially
        const { data, error } = await api.get(`${ENDPOINTS.ASSIGNMENTS}?limit=100`);

        if (error) {
            toast.error('Failed to load assignments');
            setLoading(false);
            return;
        }

        let assignmentsList = data.data || [];
        console.log('Assignments Data:', assignmentsList);

        // Identify requesters with missing name info
        const requesterIds = [];
        const requesterMap = {};

        assignmentsList.forEach((assignment) => {
            const req = assignment.requester;
            // Check if requester exists but has no usable name
            if (req && req._id && !req.name && !req.firstName && !req.displayName) {
                if (!requesterIds.includes(req._id)) {
                    requesterIds.push(req._id);
                }
            }
        });

        // Fetch user details for missing requesters
        if (requesterIds.length > 0) {
            const userPromises = requesterIds.map(async (id) => {
                const { data: userData, error: userError } = await api.get(ENDPOINTS.USER_BY_ID(id));
                if (!userError && userData?.data) {
                    requesterMap[id] = userData.data;
                }
            });
            await Promise.all(userPromises);
            console.log('Fetched user details:', requesterMap);

            // Merge user details back into assignments
            assignmentsList = assignmentsList.map((assignment) => {
                const req = assignment.requester;
                if (req && req._id && requesterMap[req._id]) {
                    return {
                        ...assignment,
                        requester: {
                            ...req,
                            ...requesterMap[req._id],
                        },
                    };
                }
                return assignment;
            });
        }

        setAssignments(assignmentsList);
        setLoading(false);
    };


    const handleAssignClick = (assignment) => {
        setSelectedAssignment(assignment);
        setAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        fetchAssignments(); // Refresh list to show updated status
    };

    const handleDelete = async (assignment) => {
        const { error } = await api.delete(ENDPOINTS.ASSIGNMENT_BY_ID(assignment._id));

        if (error) {
            toast.error('Failed to delete assignment: ' + (error.message || 'Unknown error'));
        } else {
            toast.success('Assignment deleted successfully');
            setAssignments(assignments.filter(a => a._id !== assignment._id));
        }
        setDeleteDialog({ open: false, assignment: null });
    };

    const columns = [
        {
            key: 'title',
            label: 'Assignment',
            render: (title, row) => (
                <div>
                    <div className="font-medium text-gray-900">{title}</div>
                    <div className="text-xs text-gray-500">ID: {row._id.slice(-6).toUpperCase()}</div>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (type) => (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                    {type?.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'requester',
            label: 'Requester',
            sortable: false,
            render: (requester) => {
                if (!requester) return 'N/A';
                const displayName = requester.displayName ||
                    (requester.firstName ? `${requester.firstName} ${requester.lastName || ''}`.trim() : 'Unknown');

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 overflow-hidden">
                            {requester.avatar ? (
                                <img src={requester.avatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(displayName)
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">{displayName}</div>
                            {requester.email && <div className="text-xs text-gray-500">{requester.email}</div>}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'budget',
            label: 'Budget',
            sortable: false,
            render: (budget) => (
                <div className="font-semibold text-gray-700">
                    {budget ? (
                        <span>{formatCurrency(budget.min)} - {formatCurrency(budget.max)}</span>
                    ) : 'N/A'}
                </div>
            )
        },
        {
            key: 'deadline',
            label: 'Deadline',
            render: (date) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{formatDate(date)}</span>
                    {new Date(date) < new Date() && <span className="text-xs text-red-500 font-medium">Overdue</span>}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex gap-2">
                    {(row.status === ASSIGNMENT_STATUS.OPEN || row.status === 'pending') && (
                        <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                            onClick={(e) => { e.stopPropagation(); handleAssignClick(row); }}
                        >
                            <span>⚡</span> Assign
                        </button>
                    )}
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, assignment: row }); }}
                    >
                        <span>🗑️</span> Delete
                    </button>
                </div>
            )
        }
    ];
    console.log('Columns Config:', columns);

    return (
        <div className="page-container">
            <Sidebar active="assignments" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Assignments Management</h1>
                        <p>Track and manage all assignments</p>
                    </div>
                    <button className="btn-primary" onClick={fetchAssignments}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="page-toolbar">
                    <div className="toolbar-stats">
                        <span>Total Assignments: <strong>{assignments.length}</strong></span>
                        <span>Open: <strong>{assignments.filter(a => a.status === ASSIGNMENT_STATUS.OPEN).length}</strong></span>
                        <span>In Progress: <strong>{assignments.filter(a => a.status === ASSIGNMENT_STATUS.IN_PROGRESS).length}</strong></span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={assignments}
                    loading={loading}
                    emptyMessage="No assignments found"
                />

                {assignModalOpen && selectedAssignment && (
                    <AssignAlphaModal
                        isOpen={assignModalOpen}
                        onClose={() => setAssignModalOpen(false)}
                        assignment={selectedAssignment}
                        onAssign={handleAssignSuccess}
                    />
                )}

                <ConfirmDialog
                    isOpen={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, assignment: null })}
                    onConfirm={() => handleDelete(deleteDialog.assignment)}
                    title="Delete Assignment"
                    message={`Are you sure you want to delete "${deleteDialog.assignment?.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    type="danger"
                />
            </main>
        </div>
    );
}

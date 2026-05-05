import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { ENDPOINTS } from '../config/constants';
import { formatDate } from '../utils/formatters';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        venue: '',
        date: '',
        time: '',
        isActive: true,
        highlight: false, // UI level flag (optional)
    });

    const LIMIT = 10;


    const fetchEvents = async () => {
        setLoading(true);
        // Admin needs to see all events, including inactive ones
        const { data, error } = await api.get(ENDPOINTS.EVENTS, {
            params: { page, limit: LIMIT, includeInactive: true }
        });

        if (error) {
            toast.error('Failed to load events');
        } else {
            const items = data?.data?.data || data?.data || [];
            setEvents(items);
            setTotalPages(data?.data?.pagination?.totalPages || 1);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenModal = (event = null) => {
        if (event) {
            setIsEditing(true);
            setCurrentEvent(event);
            setFormData({
                title: event.title,
                venue: event.venue,
                date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                time: event.time || '',
                isActive: event.isActive,
                highlight: event.highlight || false,
            });
        } else {
            setIsEditing(false);
            setCurrentEvent(null);
            setFormData({
                title: '',
                venue: '',
                date: '',
                time: '',
                isActive: true,
                highlight: false,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentEvent(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEditing) {
                const { error } = await api.put(ENDPOINTS.EVENT_BY_ID(currentEvent._id), formData);
                if (error) throw error;
                toast.success('Event updated successfully');
            } else {
                const { error } = await api.post(ENDPOINTS.EVENTS, formData);
                if (error) throw error;
                toast.success('Event created successfully');
            }
            handleCloseModal();
            fetchEvents();
        } catch (err) {
            toast.error(`Failed to save event: ${err.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        
        const { error } = await api.delete(ENDPOINTS.EVENT_BY_ID(id));
        if (error) {
            toast.error(`Failed to delete event: ${error.message}`);
        } else {
            toast.success('Event deleted successfully');
            fetchEvents();
        }
    };

    return (
        <div className="page-container">
            <Sidebar active="events" />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📅 Campus Events</h1>
                        <p>Manage upcoming events that appear on the college app feed</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Create Event
                    </button>
                </div>

                <div className="content-card glass">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
                            <h3>No Events Found</h3>
                            <p>Create an event to show it on the app dashboard.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600 }}>Event Title</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600 }}>Date & Time</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600 }}>Venue</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((ev) => (
                                        <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px', fontWeight: 500, color: '#1e293b' }}>
                                                {ev.title}
                                            </td>
                                            <td style={{ padding: '16px', color: '#475569' }}>
                                                {formatDate(ev.date)} {ev.time && `• ${ev.time}`}
                                            </td>
                                            <td style={{ padding: '16px', color: '#475569' }}>{ev.venue}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: 99, 
                                                    fontSize: 12, 
                                                    fontWeight: 600,
                                                    background: ev.isActive ? '#dcfce7' : '#f1f5f9',
                                                    color: ev.isActive ? '#16a34a' : '#64748b'
                                                }}>
                                                    {ev.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleOpenModal(ev)}
                                                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: 16, fontWeight: 600 }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(ev._id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '20px 0' }}>
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Prev
                            </button>
                            <span style={{ padding: '6px 12px' }}>Page {page} of {totalPages}</span>
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => p + 1)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            background: '#fff', padding: 32, borderRadius: 20, width: '100%', maxWidth: 500,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}>
                            <h2 style={{ margin: '0 0 24px', color: '#1e293b' }}>
                                {isEditing ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#475569' }}>Event Title</label>
                                    <input 
                                        type="text" required 
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none' }}
                                        placeholder="e.g. Hackathon 2025"
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#475569' }}>Venue</label>
                                    <input 
                                        type="text" required 
                                        value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none' }}
                                        placeholder="e.g. CS Dept"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#475569' }}>Date</label>
                                        <input 
                                            type="date" required 
                                            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#475569' }}>Time</label>
                                        <input 
                                            type="text" 
                                            value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none' }}
                                            placeholder="e.g. 9 AM"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                    <input 
                                        type="checkbox" id="isActive"
                                        checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                        style={{ width: 18, height: 18 }}
                                    />
                                    <label htmlFor="isActive" style={{ fontWeight: 500, color: '#1e293b', cursor: 'pointer' }}>Active (Visible on App)</label>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                    <button type="button" onClick={handleCloseModal} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--brand-500)', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                                        {isEditing ? 'Save Changes' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

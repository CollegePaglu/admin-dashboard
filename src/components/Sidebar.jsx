import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getInitials } from '../utils/formatters';

export default function Sidebar({ active }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    // State for collapsible sections
    const [openSections, setOpenSections] = useState({
        campusmart: true,
        lazypeeps: true,
        community: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Organized menu sections
    const sections = [
        {
            id: 'campusmart',
            label: 'CampusMart',
            icon: '🛒',
            items: [
                { id: 'dashboard', icon: '📊', label: 'Overview', path: '/' },
                { id: 'assignments', icon: '📝', label: 'Assignments', path: '/assignments' },
                { id: 'alphas', icon: '⭐', label: 'Alphas', path: '/alphas' },
                { id: 'payments', icon: '💳', label: 'Payments', path: '/payments' },
                { id: 'transactions', icon: '🧾', label: 'Transactions', path: '/transactions' },
                { id: 'users', icon: '🔍', label: 'User Mgmt', path: '/users' },
            ]
        },
        {
            id: 'lazypeeps',
            label: 'LazyPeeps',
            icon: '🍕',
            items: [
                { id: 'lazypeeps', icon: '🍕', label: 'Overview', path: '/lazypeeps' },
                { id: 'orders', icon: '📦', label: 'Orders', path: '/orders' },
            ]
        },
        {
            id: 'community',
            label: 'Community',
            icon: '💬',
            items: [
                { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
                { id: 'societies', icon: '🏛️', label: 'Societies', path: '/societies' },
            ]
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            items: [
                { id: 'feature-flags', icon: '🚩', label: 'Feature Flags', path: '/feature-flags' },
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">
                    <span>🛡️</span> Admin Panel
                </h2>
            </div>

            <div className="sidebar-profile">
                <div className="profile-avatar">
                    {getInitials(admin?.name || 'Admin')}
                </div>
                <div className="profile-info">
                    <p className="profile-name">{admin?.name || 'Admin'}</p>
                    <p className="profile-role">Administrator</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {sections.map((section) => (
                    <div key={section.id} className="nav-section">
                        <button
                            className="nav-section-header"
                            onClick={() => toggleSection(section.id)}
                        >
                            <span className="nav-icon">{section.icon}</span>
                            <span className="nav-label">{section.label}</span>
                            <span className={`nav-chevron ${openSections[section.id] ? 'open' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {openSections[section.id] && (
                            <div className="nav-section-items">
                                {section.items.map((item) => {
                                    const isActive = active === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => navigate(item.path)}
                                            className={`nav-item ${isActive ? 'active' : ''}`}
                                        >
                                            <span className="nav-icon">{item.icon}</span>
                                            <span className="nav-label">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={logout}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}

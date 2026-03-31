import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Sidebar({ active }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // State for sections (simplified logic or keep the original for functionality)
    const [openSections, setOpenSections] = useState({
        campusmart: true,
        lazypeeps: true,
        community: true,
        settings: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const sections = [
        {
            id: 'campusmart',
            label: 'College Paglu',
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
            items: [
                { id: 'lazypeeps', icon: '🍕', label: 'Overview', path: '/lazypeeps' },
                { id: 'orders', icon: '📦', label: 'Orders', path: '/orders' },
            ]
        },
        {
            id: 'community',
            label: 'Community',
            items: [
                { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
            ]
        },
        {
            id: 'settings',
            label: 'Settings',
            items: [
                { id: 'feature-flags', icon: '🚩', label: 'Feature Flags', path: '/feature-flags' },
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <a href="/" className="sidebar-logo cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <svg className="sidebar-logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 0L26 10L20 20L14 10L20 0Z" fill="var(--brand-400)" opacity="0.9"/>
                        <path d="M10 16L16 26L10 36L4 26L10 16Z" fill="#ffffff" opacity="0.8"/>
                        <path d="M30 16L36 26L30 36L24 26L30 16Z" fill="#ffffff" opacity="0.8"/>
                        <path d="M20 18L26 28L20 38L14 28L20 18Z" fill="#ffffff"/>
                    </svg>
                    <div className="sidebar-logo-text">College Paglu</div>
                </a>
            </div>

            <nav className="sidebar-nav">
                {sections.map((section) => (
                    <div key={section.id} className="mb-4">
                        <button
                            className="nav-section-header pb-1"
                            onClick={() => toggleSection(section.id)}
                        >
                            <span className="nav-label">{section.label}</span>
                        </button>

                        {openSections[section.id] && (
                            <div>
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
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="nav-icon" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}

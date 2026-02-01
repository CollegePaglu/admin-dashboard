import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getInitials } from '../utils/formatters';

export default function Sidebar({ active }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/' },
        { id: 'users', icon: '👥', label: 'Users', path: '/users' },
        { id: 'marketplace', icon: '🛒', label: 'Marketplace', path: '/marketplace' },
        { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
        { id: 'orders', icon: '📦', label: 'Orders', path: '/orders' },
        { id: 'lazypeeps', icon: '🍕', label: 'LazyPeeps', path: '/lazypeeps' },
        { id: 'community', icon: '💬', label: 'Community', path: '/community' },
        { id: 'stories', icon: '📸', label: 'Stories', path: '/stories' },
        { id: 'assignments', icon: '📝', label: 'Assignments', path: '/assignments' },
        { id: 'alphas', icon: '⭐', label: 'Alphas', path: '/alphas' },
        { id: 'payments', icon: '💰', label: 'Payments', path: '/payments' },
        { id: 'transactions', icon: '💳', label: 'Transactions', path: '/transactions' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">
                    <span>🛡️</span> CampusMart
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
                {menuItems.map((item) => {
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
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={logout}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}

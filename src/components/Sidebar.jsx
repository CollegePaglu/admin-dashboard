import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getInitials } from '../utils/formatters';
import './Sidebar.css';

export default function Sidebar({ active }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/' },
        { id: 'users', icon: '👥', label: 'Users', path: '/users' },
        { id: 'marketplace', icon: '🛒', label: 'Marketplace', path: '/marketplace' },
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
        <aside className="sidebar glass">
            <div className="sidebar-header">
                <h2>🛡️ CampusMart</h2>
                <div className="admin-info">
                    <div className="admin-avatar">{getInitials(admin?.name || 'Admin')}</div>
                    <span className="admin-name">{admin?.name || 'Admin'}</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${active === item.id ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <button className="logout-btn" onClick={logout}>
                🚪 Logout
            </button>
        </aside>
    );
}

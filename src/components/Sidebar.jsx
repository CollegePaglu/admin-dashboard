import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getInitials } from '../utils/formatters';
import { LayoutDashboard, Users, ShoppingCart, Package, Pizza, MessageCircle, Camera, Edit3, Star, CreditCard, DollarSign, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ active }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { id: 'users', icon: Users, label: 'Users', path: '/users' },
        { id: 'marketplace', icon: ShoppingCart, label: 'Marketplace', path: '/marketplace' },
        { id: 'orders', icon: Package, label: 'Orders', path: '/orders' },
        { id: 'lazypeeps', icon: Pizza, label: 'LazyPeeps', path: '/lazypeeps' },
        { id: 'community', icon: MessageCircle, label: 'Community', path: '/community' },
        { id: 'stories', icon: Camera, label: 'Stories', path: '/stories' },
        { id: 'assignments', icon: Edit3, label: 'Assignments', path: '/assignments' },
        { id: 'alphas', icon: Star, label: 'Alphas', path: '/alphas' },
        { id: 'payments', icon: DollarSign, label: 'Payments', path: '/payments' },
        { id: 'transactions', icon: CreditCard, label: 'Transactions', path: '/transactions' },
    ];

    return (
        <aside className="w-72 fixed inset-y-0 left-0 bg-base-100/30 backdrop-blur-xl border-r border-base-200 flex flex-col z-50">
            <div className="h-24 flex items-center px-8 border-b border-base-200/50">
                <h2 className="text-2xl font-display font-medium text-dark flex items-center gap-2">
                    <span className="text-3xl">🛡️</span> CampusMart
                </h2>
            </div>

            <div className="px-8 py-6">
                <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white/50 shadow-sm mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                        {getInitials(admin?.name || 'Admin')}
                    </div>
                    <div>
                        <p className="font-bold text-dark text-sm">{admin?.name || 'Admin'}</p>
                        <p className="text-xs text-primary/60 uppercase tracking-widest font-medium">Administrator</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 space-y-2 pb-6 no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = active === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={clsx(
                                "w-full flex items-center px-5 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-base-white border border-base-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-dark"
                                    : "text-primary/70 hover:bg-white/40 hover:text-primary border border-transparent"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 mr-4 transition-colors", isActive ? "text-dark" : "text-primary/50 group-hover:text-primary/80")} />
                            <span className={clsx(isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-base-200/50">
                <button
                    className="w-full flex items-center px-5 py-3 text-red-700/80 hover:bg-red-50 rounded-xl transition-all duration-300 text-sm font-medium"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5 mr-3 opacity-70" />
                    Logout
                </button>
            </div>
        </aside>
    );
}

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Analytics.css';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaCommentDots } from 'react-icons/fa';
import { getInitials } from '../utils/formatters';

// Import the advanced analytics components
import AnalyticsOverview from './analytics/AnalyticsOverview';
import AnalyticsUsers from './analytics/AnalyticsUsers';
import AnalyticsSocieties from './analytics/AnalyticsSocieties';
import AnalyticsPosts from './analytics/AnalyticsPosts';
import AnalyticsCommerce from './analytics/AnalyticsCommerce';
import AnalyticsOperations from './analytics/AnalyticsOperations';

// ============================================
// ANALYTICS PAGE - Main Container with Sidebar
// ============================================

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { admin } = useAuth();

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'commerce', label: 'Commerce' },
        { id: 'operations', label: 'Operations' },
        { id: 'users', label: 'Users' },
        { id: 'societies', label: 'Societies' },
        { id: 'posts', label: 'Community' },
    ];

    return (
        <div className="page-container">
            <Sidebar active="analytics" />
            
            <main className="main-content">
                {/* Global Nexus Topbar */}
                <div className="topbar">
                    <div className="topbar-left">
                        {/* Empty on left like the image, optionally add breadcrumbs here if needed later */}
                    </div>
                    
                    <div className="topbar-right">
                        <div className="nexus-search">
                            <input type="text" placeholder="Search" />
                            <FaSearch />
                        </div>

                        <div className="icon-btn">
                            <FaCommentDots />
                        </div>

                        <div className="user-profile-nav">
                            <span className="name">{admin?.name || 'Super Admin'}</span>
                            <div className="avatar flex items-center justify-center text-red-600 font-bold bg-red-200">
                                {getInitials(admin?.name || 'Admin')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mb-6">
                    <div className="welcome-msg w-fit bg-transparent border-none p-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 mr-2 text-gray-500">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome back, {admin?.name || 'Super Admin'}</h1>
                        <span className="ml-auto flex items-center gap-2 text-xs font-medium text-gray-800 ml-12 px-3 py-1.5 bg-white rounded shadow-sm border border-gray-100">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="14" width="14" className="text-green-600" xmlns="http://www.w3.org/2000/svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            The media folder is created successfully.
                        </span>
                    </div>
                </div>

                {/* Tab Navigation (Nexus Style) */}
                <div className="analytics-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={activeTab === tab.id ? 'active' : ''}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="analytics-content pt-2">
                    {activeTab === 'overview' && <AnalyticsOverview />}
                    {activeTab === 'commerce' && <AnalyticsCommerce />}
                    {activeTab === 'operations' && <AnalyticsOperations />}
                    {activeTab === 'users' && <AnalyticsUsers />}
                    {activeTab === 'societies' && <AnalyticsSocieties />}
                    {activeTab === 'posts' && <AnalyticsPosts />}
                </div>
            </main>
        </div>
    );
};

export default Analytics;


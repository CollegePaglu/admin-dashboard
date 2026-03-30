import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './Analytics.css';

// Import the advanced analytics components
import AnalyticsOverview from './analytics/AnalyticsOverview';
import AnalyticsUsers from './analytics/AnalyticsUsers';
import AnalyticsSocieties from './analytics/AnalyticsSocieties';
import AnalyticsPosts from './analytics/AnalyticsPosts';

// ============================================
// ANALYTICS PAGE - Main Container with Sidebar
// ============================================

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'societies', label: 'Societies', icon: '🏛️' },
        { id: 'posts', label: 'Posts & Community', icon: '📝' },
    ];

    return (
        <div className="page-container">
            <Sidebar active="analytics" />
            <main className="main-content bg-gray-50 min-h-screen pb-12">
                <div className="page-header py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-500 mt-1">Real-time deep insights into App V1 performance and community engagement.</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="analytics-tabs mb-6 flex overflow-x-auto border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap border-b-2
                                ${activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="analytics-content px-2">
                    {activeTab === 'overview' && <AnalyticsOverview />}
                    {activeTab === 'users' && <AnalyticsUsers />}
                    {activeTab === 'societies' && <AnalyticsSocieties />}
                    {activeTab === 'posts' && <AnalyticsPosts />}
                </div>
            </main>
        </div>
    );
};

export default Analytics;

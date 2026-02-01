import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import './Analytics.css';

// ============================================
// ANALYTICS PAGE - Main Container with Sidebar
// ============================================

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await api.analytics.getOverview();
            if (apiError) throw new Error(apiError.message);
            setStats(data?.data || data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'societies', label: 'Societies', icon: '🏛️' },
        { id: 'posts', label: 'Posts', icon: '📝' },
    ];

    return (
        <div className="page-container">
            <Sidebar active="analytics" />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Analytics Dashboard</h1>
                        <p>Real-time insights into your platform's performance</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="analytics-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="analytics-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading analytics...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state glass">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                            <button className="btn-primary" onClick={fetchAnalytics}>
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && <OverviewTab stats={stats} />}
                            {activeTab === 'users' && <UsersTab stats={stats} />}
                            {activeTab === 'societies' && <SocietiesTab stats={stats} />}
                            {activeTab === 'posts' && <PostsTab stats={stats} />}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

// ============================================
// OVERVIEW TAB
// ============================================
const OverviewTab = ({ stats }) => {
    const overviewStats = [
        {
            icon: '👥',
            label: 'Total Users',
            value: stats?.users?.total || 0,
            subtext: `${stats?.users?.monthlyActive || 0} monthly active`,
            trend: '+12%',
            color: 'blue',
        },
        {
            icon: '🏛️',
            label: 'Active Societies',
            value: stats?.societies?.active || 0,
            subtext: `${stats?.societies?.total || 0} total registered`,
            trend: '+5%',
            color: 'purple',
        },
        {
            icon: '📝',
            label: 'Posts Created',
            value: stats?.posts?.total || 0,
            subtext: `${stats?.posts?.trending || 0} trending now`,
            trend: '+8%',
            color: 'pink',
        },
        {
            icon: '📅',
            label: 'Events Today',
            value: stats?.events?.today || 0,
            subtext: 'Real-time volume',
            trend: 'stable',
            color: 'orange',
        },
    ];

    const userFunnel = [
        { stage: 'Registered', count: stats?.users?.total || 0 },
        { stage: 'Verified', count: stats?.users?.verified || 0 },
        { stage: 'Active (7d)', count: stats?.users?.weeklyActive || 0 },
        { stage: 'Daily Active', count: stats?.users?.dailyActive || 0 },
    ];

    return (
        <div className="overview-tab">
            {/* Quick Stats */}
            <div className="stats-grid">
                {overviewStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* User Growth Chart */}
                <div className="chart-card glass">
                    <div className="chart-header">
                        <h3>User Growth Trends</h3>
                        <span className="chart-badge">+24% this month</span>
                    </div>
                    <div className="chart-placeholder">
                        <div className="mini-chart">
                            {[40, 55, 45, 70, 60, 85, 90].map((height, i) => (
                                <div
                                    key={i}
                                    className="chart-bar"
                                    style={{ height: `${height}%` }}
                                ></div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* User Funnel */}
                <div className="chart-card glass">
                    <div className="chart-header">
                        <h3>User Funnel</h3>
                    </div>
                    <div className="funnel-chart">
                        {userFunnel.map((item, index) => (
                            <div key={index} className="funnel-item">
                                <div className="funnel-label">{item.stage}</div>
                                <div className="funnel-bar-container">
                                    <div
                                        className="funnel-bar"
                                        style={{
                                            width: `${(item.count / (userFunnel[0].count || 1)) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="funnel-count">{item.count.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Stats */}
            <div className="detail-stats-row">
                <DetailStatCard
                    icon="📊"
                    label="Daily Active Users"
                    value={stats?.users?.dailyActive || 0}
                    badge="DAU"
                />
                <DetailStatCard
                    icon="📈"
                    label="Weekly Active Users"
                    value={stats?.users?.weeklyActive || 0}
                    badge="WAU"
                />
                <DetailStatCard
                    icon="🚀"
                    label="Monthly Active Users"
                    value={stats?.users?.monthlyActive || 0}
                    badge="MAU"
                />
            </div>
        </div>
    );
};

// ============================================
// USERS TAB
// ============================================
const UsersTab = ({ stats }) => {
    return (
        <div className="tab-content">
            <div className="stats-grid">
                <StatCard
                    icon="👥"
                    label="Total Users"
                    value={stats?.users?.total || 0}
                    subtext="All registered users"
                    color="blue"
                />
                <StatCard
                    icon="✅"
                    label="Verified Users"
                    value={stats?.users?.verified || 0}
                    subtext="Email verified"
                    color="green"
                />
                <StatCard
                    icon="📱"
                    label="Daily Active"
                    value={stats?.users?.dailyActive || 0}
                    subtext="Last 24 hours"
                    color="purple"
                />
                <StatCard
                    icon="📅"
                    label="New This Week"
                    value={stats?.users?.newThisWeek || 0}
                    subtext="Recent signups"
                    color="orange"
                />
            </div>
        </div>
    );
};

// ============================================
// SOCIETIES TAB
// ============================================
const SocietiesTab = ({ stats }) => {
    return (
        <div className="tab-content">
            <div className="stats-grid">
                <StatCard
                    icon="🏛️"
                    label="Total Societies"
                    value={stats?.societies?.total || 0}
                    subtext="Registered organizations"
                    color="purple"
                />
                <StatCard
                    icon="✨"
                    label="Active Societies"
                    value={stats?.societies?.active || 0}
                    subtext="With recent activity"
                    color="blue"
                />
                <StatCard
                    icon="👑"
                    label="Top Society"
                    value={stats?.societies?.topByMembers?.name || 'N/A'}
                    subtext={`${stats?.societies?.topByMembers?.memberCount || 0} members`}
                    color="pink"
                />
                <StatCard
                    icon="📈"
                    label="Avg Members"
                    value={stats?.societies?.avgMembers || 0}
                    subtext="Per society"
                    color="orange"
                />
            </div>
        </div>
    );
};

// ============================================
// POSTS TAB
// ============================================
const PostsTab = ({ stats }) => {
    return (
        <div className="tab-content">
            <div className="stats-grid">
                <StatCard
                    icon="📝"
                    label="Total Posts"
                    value={stats?.posts?.total || 0}
                    subtext="All time"
                    color="blue"
                />
                <StatCard
                    icon="🔥"
                    label="Trending Posts"
                    value={stats?.posts?.trending || 0}
                    subtext="High engagement"
                    color="orange"
                />
                <StatCard
                    icon="💬"
                    label="Total Comments"
                    value={stats?.posts?.totalComments || 0}
                    subtext="User interactions"
                    color="purple"
                />
                <StatCard
                    icon="❤️"
                    label="Total Likes"
                    value={stats?.posts?.totalLikes || 0}
                    subtext="Engagement"
                    color="pink"
                />
            </div>
        </div>
    );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon, label, value, subtext, trend, color = 'blue' }) => {
    const colorStyles = {
        blue: { bg: '#eff6ff', text: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
        purple: { bg: '#f5f3ff', text: '#7c3aed', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
        pink: { bg: '#fdf2f8', text: '#db2777', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
        orange: { bg: '#fff7ed', text: '#ea580c', gradient: 'linear-gradient(135deg, #f97316, #c2410c)' },
        green: { bg: '#f0fdf4', text: '#16a34a', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <div className="stat-card glass">
            <div className="stat-card-header">
                <div
                    className="stat-card-icon"
                    style={{ background: style.gradient }}
                >
                    {icon}
                </div>
                {trend && (
                    <span className="stat-trend" style={{ color: style.text, background: style.bg }}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="stat-card-body">
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
                {subtext && <p className="stat-subtext">{subtext}</p>}
            </div>
        </div>
    );
};

// ============================================
// DETAIL STAT CARD COMPONENT
// ============================================
const DetailStatCard = ({ icon, label, value, badge }) => {
    return (
        <div className="detail-stat-card glass">
            <div className="detail-stat-icon">{icon}</div>
            <div className="detail-stat-info">
                <p className="detail-stat-label">{label}</p>
                <h4 className="detail-stat-value">{value.toLocaleString()}</h4>
            </div>
            {badge && <span className="detail-stat-badge">{badge}</span>}
        </div>
    );
};

export default Analytics;

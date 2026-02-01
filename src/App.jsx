import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// API and utilities
import { api } from './api/client';
import { ENDPOINTS, ORDER_STATUS, LISTING_STATUS, PAYMENT_STATUS, ALPHA_STATUS, STATUS_COLORS } from './config/constants';
import { formatCurrency, formatDate, formatRelativeTime, formatStatus, getInitials } from './utils/formatters';
import { exportToCSV } from './utils/exportData';

// Components
import DataTable from './components/DataTable';
import Modal from './components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import SearchBar from './components/SearchBar';

// Hooks
import { usePagination } from './hooks/usePagination';

// ============================================
// AUTH CONTEXT
// ============================================

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminData');
    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (adminData, tokens) => {
    localStorage.setItem('adminToken', tokens.accessToken);
    localStorage.setItem('adminRefreshToken', tokens.refreshToken);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// PROTECTED ROUTE
// ============================================

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Import Sidebar
import Sidebar from './components/Sidebar';

// ============================================
// STATUS BADGE COMPONENT
// ============================================

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280';
  return (
    <span className="status-badge" style={{ backgroundColor: color }}>
      {formatStatus(status)}
    </span>
  );
}

// ============================================
// LOGIN PAGE
// ============================================

function LoginPage() {
  const [step, setStep] = useState('credentials');
  const [phone, setPhone] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await api.post(ENDPOINTS.ADMIN_AUTH_SEND_OTP, { phone, collegeId });

    if (apiError) {
      setError(apiError.message);
      setLoading(false);
      return;
    }

    setDevOtp(data.otp || '');
    setStep('otp');
    setLoading(false);
    toast.success('OTP sent successfully!');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await api.post(ENDPOINTS.ADMIN_AUTH_VERIFY_OTP, { phone, collegeId, otp });

    if (apiError) {
      setError(apiError.message);
      setLoading(false);
      return;
    }

    login(data.admin, data.tokens);
    toast.success('Login successful!');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p>CampusMart Administration</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 'credentials' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>College ID</label>
              <input
                type="text"
                placeholder="ADMIN001"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              {devOtp && <small className="dev-otp">Dev OTP: {devOtp}</small>}
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep('credentials')}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE
// ============================================

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data, error } = await api.get(ENDPOINTS.DASHBOARD);
    if (error) {
      toast.error('Failed to load dashboard stats');
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <Sidebar active="dashboard" />
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with CampusMart.</p>
        </div>

        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Orders</h3>
                <div className="stat-value">{stats.orders?.total || 0}</div>
                <div className="stat-detail">Pending: {stats.orders?.pending || 0}</div>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Revenue</h3>
                <div className="stat-value">{formatCurrency(stats.orders?.revenue || 0)}</div>
                <div className="stat-detail">Completed: {stats.orders?.completed || 0}</div>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <h3>Assignments</h3>
                <div className="stat-value">{stats.assignments?.total || 0}</div>
                <div className="stat-detail">In Progress: {stats.assignments?.inProgress || 0}</div>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Alphas</h3>
                <div className="stat-value">{stats.alphas?.verified || 0}</div>
                <div className="stat-detail">Pending: {stats.alphas?.pending || 0}</div>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Today's Schedules</h3>
                <div className="stat-value">{stats.schedules?.today || 0}</div>
                <div className="stat-detail">Pending: {stats.schedules?.pending || 0}</div>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <h3>Pending Payments</h3>
                <div className="stat-value">{stats.payments?.pendingRequests || 0}</div>
                <div className="stat-detail">{formatCurrency(stats.payments?.totalPending || 0)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="error">Failed to load statistics</div>
        )}
      </main>
    </div>
  );
}

// Import pages
import UsersPage from './pages/Users';
import AnalyticsUserDetail from './pages/analytics/AnalyticsUserDetail';
import AnalyticsSocietyDetail from './pages/analytics/AnalyticsSocietyDetail';
import MarketplacePage from './pages/Marketplace';
import OrdersPage from './pages/Orders';
import PaymentsPage from './pages/Payments';
import AlphasPage from './pages/Alphas';
import LazyPeepsPage from './pages/LazyPeeps';
import AssignmentsPage from './pages/Assignments';
import AnalyticsPage from './pages/Analytics';
import StoriesPage from './pages/Stories';
import CommunityPage from './pages/Community';
import TransactionsPage from './pages/Transactions';

// Export App component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/alphas" element={<ProtectedRoute><AlphasPage /></ProtectedRoute>} />
          <Route path="/lazypeeps" element={<ProtectedRoute><LazyPeepsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/analytics/users/:id" element={<ProtectedRoute><AnalyticsUserDetail /></ProtectedRoute>} />
          <Route path="/analytics/societies/:id" element={<ProtectedRoute><AnalyticsSocietyDetail /></ProtectedRoute>} />
          {/* Community and Content */}
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/stories" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// API and utilities
import { api } from './api/client';
import { ENDPOINTS } from './config/constants';

// Auth Context
import { useAuth, AuthProvider } from './context/AuthContext';

// ============================================
// PROTECTED ROUTE
// ============================================

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Import Sidebar
import Sidebar from './components/Sidebar';


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
  // Redirect to users page as requested (keeping only user management)
  return <Navigate to="/users" replace />;
}

// Import pages
import UsersPage from './pages/Users';
import AnalyticsUserDetail from './pages/analytics/AnalyticsUserDetail';
import AnalyticsSocietyDetail from './pages/analytics/AnalyticsSocietyDetail';
import AnalyticsPostDetail from './pages/analytics/AnalyticsPostDetail';
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
import FeatureFlagsPage from './pages/FeatureFlags';
import ConfessionsPage from './pages/Confessions';
import EventsPage from './pages/Events';

// CampusMart Analytics Pages
import CampusMartDashboard from './pages/campusmart/Dashboard';
import CampusMartRevenue from './pages/campusmart/Revenue';
import CampusMartUsers from './pages/campusmart/Users';
import CampusMartAlphas from './pages/campusmart/Alphas';

// Export App component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/confessions" element={<ProtectedRoute><ConfessionsPage /></ProtectedRoute>} />
          {/*
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/alphas" element={<ProtectedRoute><AlphasPage /></ProtectedRoute>} />
          <Route path="/lazypeeps" element={<ProtectedRoute><LazyPeepsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/analytics/users/:id" element={<ProtectedRoute><AnalyticsUserDetail /></ProtectedRoute>} />
          <Route path="/analytics/societies/:id" element={<ProtectedRoute><AnalyticsSocietyDetail /></ProtectedRoute>} />
          <Route path="/analytics/posts/:id" element={<ProtectedRoute><AnalyticsPostDetail /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/stories" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/feature-flags" element={<ProtectedRoute><FeatureFlagsPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/campusmart" element={<ProtectedRoute><CampusMartDashboard /></ProtectedRoute>} />
          <Route path="/campusmart/revenue" element={<ProtectedRoute><CampusMartRevenue /></ProtectedRoute>} />
          <Route path="/campusmart/users" element={<ProtectedRoute><CampusMartUsers /></ProtectedRoute>} />
          <Route path="/campusmart/alphas" element={<ProtectedRoute><CampusMartAlphas /></ProtectedRoute>} />
          */}
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

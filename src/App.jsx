import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Configuration
const API_BASE = 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Auth Provider
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

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Login Page
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
    try {
      const res = await api.post('/admin-auth/otp/send', { phone, collegeId });
      setDevOtp(res.data.otp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin-auth/otp/verify', { phone, collegeId, otp });
      login(res.data.admin, res.data.tokens);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p>CollegePaglu Administration</p>
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

// Sidebar Component
function Sidebar({ active }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/' },
    { id: 'orders', icon: '📦', label: 'Orders', path: '/orders' },
    { id: 'payments', icon: '💰', label: 'Payments', path: '/payments' },
    { id: 'alphas', icon: '👥', label: 'Alphas', path: '/alphas' },
    { id: 'items', icon: '🛒', label: 'Marketplace', path: '/items' },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <h2>🛡️ Admin</h2>
        <span className="admin-name">{admin?.name}</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.path}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate(item.path); }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
      <button className="logout-btn" onClick={logout}>
        🚪 Logout
      </button>
    </aside>
  );
}

// Dashboard Page
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <Sidebar active="dashboard" />
      <main className="main-content">
        <h1>Dashboard Overview</h1>
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card glass">
              <h3>📦 Orders</h3>
              <div className="stat-value">{stats.orders?.total || 0}</div>
              <div className="stat-detail">Pending: {stats.orders?.pending || 0}</div>
            </div>
            <div className="stat-card glass">
              <h3>💰 Revenue</h3>
              <div className="stat-value">₹{stats.orders?.revenue || 0}</div>
              <div className="stat-detail">Completed: {stats.orders?.completed || 0}</div>
            </div>
            <div className="stat-card glass">
              <h3>📝 Assignments</h3>
              <div className="stat-value">{stats.assignments?.total || 0}</div>
              <div className="stat-detail">In Progress: {stats.assignments?.inProgress || 0}</div>
            </div>
            <div className="stat-card glass">
              <h3>👥 Alphas</h3>
              <div className="stat-value">{stats.alphas?.verified || 0}</div>
              <div className="stat-detail">Pending: {stats.alphas?.pending || 0}</div>
            </div>
            <div className="stat-card glass">
              <h3>📅 Today's Schedules</h3>
              <div className="stat-value">{stats.schedules?.today || 0}</div>
              <div className="stat-detail">Pending: {stats.schedules?.pending || 0}</div>
            </div>
            <div className="stat-card glass">
              <h3>💳 Pending Payments</h3>
              <div className="stat-value">{stats.payments?.pendingRequests || 0}</div>
              <div className="stat-detail">₹{stats.payments?.totalPending || 0}</div>
            </div>
          </div>
        ) : (
          <div className="error">Failed to load statistics</div>
        )}
      </main>
    </div>
  );
}

// Orders Page
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="page-container">
      <Sidebar active="orders" />
      <main className="main-content">
        <h1>Orders Management</h1>
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <div className="table-container glass">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="5">No orders found</td></tr>
                ) : orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.buyerId?.name || 'N/A'}</td>
                    <td>₹{order.totalAmount}</td>
                    <td><span className={`badge ${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// Payments Page
function PaymentsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/payments/requests');
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/payments/requests/${id}/approve`);
      setRequests(requests.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="payments" />
      <main className="main-content">
        <h1>Payment Requests</h1>
        {loading ? (
          <div className="loading">Loading payment requests...</div>
        ) : (
          <div className="table-container glass">
            <table>
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="6">No payment requests</td></tr>
                ) : requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.requesterId?.name || 'N/A'}</td>
                    <td>{req.requesterType}</td>
                    <td>₹{req.amount}</td>
                    <td>₹{req.netAmount}</td>
                    <td><span className={`badge ${req.status}`}>{req.status}</span></td>
                    <td>
                      {req.status === 'pending' && (
                        <button className="btn-sm btn-success" onClick={() => handleApprove(req._id)}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// Alphas Page
function AlphasPage() {
  const [alphas, setAlphas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlphas = async () => {
      try {
        const res = await api.get('/alphas');
        setAlphas(res.data.alphas || []);
      } catch (err) {
        console.error('Failed to fetch alphas:', err);
      }
      setLoading(false);
    };
    fetchAlphas();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.post(`/admin/alphas/${id}/verify`);
      setAlphas(alphas.map(a => a._id === id ? { ...a, status: 'verified' } : a));
    } catch (err) {
      alert('Failed to verify alpha');
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="alphas" />
      <main className="main-content">
        <h1>Alphas Management</h1>
        {loading ? (
          <div className="loading">Loading alphas...</div>
        ) : (
          <div className="cards-grid">
            {alphas.length === 0 ? (
              <div>No alphas found</div>
            ) : alphas.map((alpha) => (
              <div key={alpha._id} className="alpha-card glass">
                <div className="alpha-header">
                  <h3>{alpha.user?.name || 'Unknown'}</h3>
                  <span className={`badge ${alpha.status}`}>{alpha.status}</span>
                </div>
                <div className="alpha-details">
                  <p><strong>Skills:</strong> {alpha.skills?.join(', ') || 'N/A'}</p>
                  <p><strong>Rating:</strong> ⭐ {alpha.rating?.toFixed(1) || '0.0'}</p>
                  <p><strong>Completed:</strong> {alpha.completedAssignments || 0} assignments</p>
                </div>
                {alpha.status === 'pending' && (
                  <button className="btn-primary" onClick={() => handleVerify(alpha._id)}>
                    Verify Alpha
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Marketplace Items Page
function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/admin/items');
        setItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  return (
    <div className="page-container">
      <Sidebar active="items" />
      <main className="main-content">
        <h1>Marketplace Items</h1>
        {loading ? (
          <div className="loading">Loading items...</div>
        ) : (
          <div className="table-container glass">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Seller</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="5">No items found</td></tr>
                ) : items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>₹{item.price}</td>
                    <td>{item.sellerId?.name || 'N/A'}</td>
                    <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/alphas" element={<ProtectedRoute><AlphasPage /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

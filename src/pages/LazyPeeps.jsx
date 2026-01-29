/**
 * LazyPeeps Admin Dashboard
 * Manage vendors, snacks, and orders with professional-grade features
 * 
 * Flow: User Action → State Update → API Call → Response → UI Update
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import '../pages/LazyPeeps.css';

// ============================================
// DUMMY DATA - FOR DEVELOPMENT & TESTING
// ============================================
const DUMMY_VENDORS = [
  {
    _id: '507f1f77bcf86cd799439010',
    businessName: 'Rajesh Foods',
    description: 'Authentic South Indian snacks and food',
    address: '123 Main Street, Delhi',
    phoneNumber: '9876543210',
    email: 'rajesh@foods.com',
    isOpen: true,
    rating: 4.5,
    reviewCount: 245,
  },
  {
    _id: '507f1f77bcf86cd799439011',
    businessName: 'North Indian Delight',
    description: 'Traditional North Indian cuisine',
    address: '456 Park Avenue, Mumbai',
    phoneNumber: '9876543211',
    email: 'north@delight.com',
    isOpen: true,
    rating: 4.2,
    reviewCount: 189,
  },
  {
    _id: '507f1f77bcf86cd799439012',
    businessName: 'Tea House',
    description: 'Premium tea and coffee',
    address: '789 Tea Lane, Bangalore',
    phoneNumber: '9876543212',
    email: 'tea@house.com',
    isOpen: false,
    rating: 3.8,
    reviewCount: 120,
  },
];

const DUMMY_SNACKS = [
  {
    _id: '607f1f77bcf86cd799439001',
    name: 'Samosa',
    description: 'Crispy pastry with spicy potato and pea filling',
    price: 40,
    originalPrice: 50,
    category: 'Snacks',
    isAvailable: true,
    vendorId: '507f1f77bcf86cd799439010',
    vendorName: 'Rajesh Foods',
    rating: 4.8,
    reviewCount: 342,
    createdAt: new Date('2026-01-20'),
  },
  {
    _id: '607f1f77bcf86cd799439002',
    name: 'Vada',
    description: 'Soft and fluffy lentil fritters',
    price: 30,
    originalPrice: 35,
    category: 'Snacks',
    isAvailable: true,
    vendorId: '507f1f77bcf86cd799439010',
    vendorName: 'Rajesh Foods',
    rating: 4.5,
    reviewCount: 215,
    createdAt: new Date('2026-01-18'),
  },
  {
    _id: '607f1f77bcf86cd799439003',
    name: 'Masala Dosa',
    description: 'Crispy dosa with masala potato filling and sambar',
    price: 120,
    originalPrice: 140,
    category: 'Main Course',
    isAvailable: true,
    vendorId: '507f1f77bcf86cd799439010',
    vendorName: 'Rajesh Foods',
    rating: 4.9,
    reviewCount: 456,
    createdAt: new Date('2026-01-15'),
  },
  {
    _id: '607f1f77bcf86cd799439004',
    name: 'Chole Bhature',
    description: 'Soft fried bread with spiced chickpea curry',
    price: 80,
    originalPrice: 100,
    category: 'Main Course',
    isAvailable: true,
    vendorId: '507f1f77bcf86cd799439011',
    vendorName: 'North Indian Delight',
    rating: 4.7,
    reviewCount: 324,
    createdAt: new Date('2026-01-10'),
  },
  {
    _id: '607f1f77bcf86cd799439005',
    name: 'Naan',
    description: 'Traditional leavened flatbread baked in tandoor',
    price: 50,
    originalPrice: 60,
    category: 'Bread',
    isAvailable: true,
    vendorId: '507f1f77bcf86cd799439011',
    vendorName: 'North Indian Delight',
    rating: 4.6,
    reviewCount: 289,
    createdAt: new Date('2026-01-12'),
  },
];

const DUMMY_ORDERS = [
  {
    _id: '707f1f77bcf86cd799439001',
    totalAmount: 280,
    status: 'pending',
    createdAt: new Date('2026-01-30T09:00:00'),
    userId: 'user123',
    items: 3,
  },
  {
    _id: '707f1f77bcf86cd799439002',
    totalAmount: 150,
    status: 'confirmed',
    createdAt: new Date('2026-01-30T08:30:00'),
    userId: 'user124',
    items: 2,
  },
  {
    _id: '707f1f77bcf86cd799439003',
    totalAmount: 320,
    status: 'preparing',
    createdAt: new Date('2026-01-29T16:45:00'),
    userId: 'user125',
    items: 4,
  },
  {
    _id: '707f1f77bcf86cd799439004',
    totalAmount: 90,
    status: 'ready',
    createdAt: new Date('2026-01-29T14:20:00'),
    userId: 'user126',
    items: 2,
  },
  {
    _id: '707f1f77bcf86cd799439005',
    totalAmount: 200,
    status: 'delivered',
    createdAt: new Date('2026-01-28T11:00:00'),
    userId: 'user127',
    items: 3,
  },
];

const DUMMY_PRINTOUT_ORDERS = [
  {
    _id: '807f1f77bcf86cd799439001',
    userId: 'user123',
    fileUrl: 'https://example.com/docs/assignment1.pdf',
    config: { bwPages: 15, colorPages: 5, binding: true },
    totalCost: 50,
    status: 'pending',
    createdAt: new Date('2026-01-30T10:30:00'),
    pickupLocation: 'Building A, Room 101',
  },
  {
    _id: '807f1f77bcf86cd799439002',
    userId: 'user124',
    fileUrl: 'https://example.com/docs/thesis.pdf',
    config: { bwPages: 50, colorPages: 20, binding: true },
    totalCost: 150,
    status: 'pending',
    createdAt: new Date('2026-01-30T10:15:00'),
    pickupLocation: 'Building B, Reception',
  },
  {
    _id: '807f1f77bcf86cd799439003',
    userId: 'user125',
    fileUrl: 'https://example.com/docs/project.pdf',
    config: { bwPages: 8, colorPages: 2, binding: false },
    totalCost: 24,
    status: 'pending',
    createdAt: new Date('2026-01-30T09:45:00'),
    pickupLocation: 'Building C, Floor 2',
  },
  {
    _id: '807f1f77bcf86cd799439004',
    userId: 'user126',
    fileUrl: 'https://example.com/docs/report.pdf',
    config: { bwPages: 25, colorPages: 10, binding: true },
    totalCost: 80,
    status: 'approved',
    createdAt: new Date('2026-01-30T08:20:00'),
    pickupLocation: 'Building A, Room 205',
  },
  {
    _id: '807f1f77bcf86cd799439005',
    userId: 'user127',
    fileUrl: 'https://example.com/docs/notes.pdf',
    config: { bwPages: 30, colorPages: 0, binding: false },
    totalCost: 60,
    status: 'printing',
    createdAt: new Date('2026-01-29T15:10:00'),
    pickupLocation: 'Building D, Main Office',
  },
];

// ============================================
// FORM VALIDATION RULES
// ============================================
const VALIDATION_RULES = {
  vendor: {
    businessName: { min: 3, max: 100, required: true },
    description: { max: 500 },
    address: { min: 5, max: 200, required: true },
    phoneNumber: { pattern: /^[0-9]{10}$/, required: true },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    isOpen: { required: false },
  },
  snack: {
    name: { min: 3, max: 100, required: true },
    description: { max: 500 },
    price: { min: 1, max: 10000, required: true },
    category: { required: true },
    vendorId: { required: true },
    isAvailable: { required: false },
  },
};

// Input sanitization to prevent XSS
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[<>"']/g, (char) => ({
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]))
    .substring(0, 1000);
};

// ============================================
// MAIN COMPONENT
// ============================================
const LazyPeeps = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [printoutOrders, setPrintoutOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [useDummyData, setUseDummyData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) console.warn('[LazyPeeps] No auth token found.');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Use dummy data if enabled (for development)
      if (useDummyData) {
        if (activeTab === 'vendors') {
          setVendors(DUMMY_VENDORS);
        } else if (activeTab === 'snacks') {
          setSnacks(DUMMY_SNACKS);
        } else if (activeTab === 'orders') {
          setOrders(DUMMY_ORDERS);
        } else if (activeTab === 'printout') {
          setPrintoutOrders(DUMMY_PRINTOUT_ORDERS);
        }
        setFetchError(null);
        return;
      }

      // Otherwise fetch from API
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token not found. Please login.');
      }

      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'vendors') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors`, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch vendors: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from server');
        }
        setVendors(data.data);
      } else if (activeTab === 'snacks') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors/products`, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch snacks: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from server');
        }
        setSnacks(data.data);
      } else if (activeTab === 'orders') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lazypeeps/orders`, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from server');
        }
        setOrders(data.data);
      } else if (activeTab === 'printout') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lazypeeps/printout-orders`, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch printout orders: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from server');
        }
        setPrintoutOrders(data.data);
      }
      setFetchError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      console.error('[LazyPeeps] Fetch Error:', errorMessage);
      setFetchError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VALIDATION LOGIC
  // ============================================
  const validateForm = (data, type) => {
    const errors = {};
    const rules = type === 'vendor' ? VALIDATION_RULES.vendor : VALIDATION_RULES.snack;

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = data[field];

      // Check required
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${field} is required`;
        return;
      }

      // Skip if not required and empty
      if (!rule.required && (!value || value.toString().trim() === '')) {
        return;
      }

      // Check min length
      if (rule.min && value.toString().length < rule.min) {
        errors[field] = `${field} must be at least ${rule.min} characters`;
      }

      // Check max length
      if (rule.max && value.toString().length > rule.max) {
        errors[field] = `${field} must not exceed ${rule.max} characters`;
      }

      // Check pattern (regex)
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        errors[field] = `${field} format is invalid`;
      }

      // Check min value (for numbers)
      if (rule.min && !isNaN(value) && value < rule.min) {
        errors[field] = `${field} must be at least ${rule.min}`;
      }

      // Check max value (for numbers)
      if (rule.max && !isNaN(value) && value > rule.max) {
        errors[field] = `${field} must not exceed ${rule.max}`;
      }
    });

    return errors;
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    const itemName = (item.name || item.businessName || 'item').replace(/[<>"']/g, '');
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const endpoint =
          activeTab === 'vendors'
            ? `/vendors/${item._id}`
            : activeTab === 'snacks'
            ? `/vendors/${item.vendorId}/products/${item._id}`
            : `/lazypeeps/orders/${item._id}`;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
        }

        await fetchData();
        alert(`${itemName} deleted successfully!`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
        console.error('[LazyPeeps] Delete Error:', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleSave = async () => {
    // Prevent duplicate submissions
    if (isSaving) {
      alert('Please wait while the previous request is being processed...');
      return;
    }

    // Verify token exists before making API call
    const token = localStorage.getItem('adminToken');
    if (!token && !useDummyData) {
      alert('Authentication token not found. Please login.');
      return;
    }

    // ============================================
    // STEP 1: VALIDATE FORM
    // ============================================
    const validateType = activeTab === 'vendors' ? 'vendor' : 'snack';
    const errors = validateForm(formData, validateType);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fix the errors in the form');
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      // ============================================
      // STEP 2: SANITIZE & PREPARE REQUEST
      // ============================================
      const sanitizedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? sanitizeInput(value) : value;
        return acc;
      }, {});

      const method = editingItem ? 'PATCH' : 'POST';
      const endpoint =
        activeTab === 'vendors'
          ? `/vendors${editingItem ? `/${editingItem._id}` : ''}`
          : activeTab === 'snacks'
          ? `/vendors/${sanitizedData.vendorId}/products${editingItem ? `/${editingItem._id}` : ''}`
          : `/lazypeeps/orders`;

      console.log(`[LazyPeeps] ${method} ${endpoint}`, sanitizedData);

      // ============================================
      // STEP 3: SEND API REQUEST
      // ============================================
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      // ============================================
      // STEP 4: HANDLE RESPONSE
      // ============================================
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Empty response from server');
      }
      console.log('[LazyPeeps] Response:', data);

      // ============================================
      // STEP 5: UPDATE UI
      // ============================================
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      setFormErrors({});

      // Refresh data
      await fetchData();

      // Show success message
      const action = editingItem ? 'updated' : 'created';
      alert(`${activeTab === 'vendors' ? 'Vendor' : 'Snack'} ${action} successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      console.error('[LazyPeeps] Save Error:', errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Approve/Reject printout order
  const handleApprovePrintout = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    if (!token && !useDummyData) {
      alert('Authentication token not found. Please login.');
      return;
    }

    try {
      if (useDummyData) {
        // Update dummy data
        setPrintoutOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Print order ${newStatus} successfully!`);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lazypeeps/printout-orders/${orderId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.status}`);
      }

      await fetchData();
      alert(`Print order ${newStatus} successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve order';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Vendor columns
  const vendorColumns = [
    { key: '_id', label: 'ID', width: '120px' },
    { key: 'businessName', label: 'Business Name', width: '200px' },
    { key: 'address', label: 'Address', width: '200px' },
    { key: 'phoneNumber', label: 'Phone', width: '120px' },
    {
      key: 'isOpen',
      label: 'Status',
      width: '100px',
      render: (value) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          {value ? 'Open' : 'Closed'}
        </span>
      ),
    },
  ];

  // Snacks columns
  const snacksColumns = [
    { key: '_id', label: 'ID', width: '120px' },
    { key: 'name', label: 'Product Name', width: '180px' },
    { key: 'category', label: 'Category', width: '120px' },
    {
      key: 'price',
      label: 'Price',
      width: '100px',
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'isAvailable',
      label: 'Available',
      width: '100px',
      render: (value) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  // Orders columns
  const ordersColumns = [
    { key: '_id', label: 'Order ID', width: '120px' },
    { key: 'totalAmount', label: 'Amount', width: '100px', render: (v) => `₹${v.toFixed(2)}` },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (value) => <span className={`status-badge ${value}`}>{value}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: '150px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Printout Orders columns
  const printoutColumns = [
    { key: '_id', label: 'Order ID', width: '140px' },
    {
      key: 'config',
      label: 'Pages',
      width: '140px',
      render: (config) => `${config.bwPages} BW, ${config.colorPages} Color`,
    },
    {
      key: 'totalCost',
      label: 'Cost',
      width: '100px',
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (value) => (
        <span className={`status-badge ${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'pickupLocation',
      label: 'Pickup',
      width: '180px',
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: '130px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const renderModal = () => {
    if (!showModal) return null;

    if (activeTab === 'vendors') {
      return (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? "Edit Vendor" : "Add New Vendor"}>
          <div className="form-group">
            <label>Business Name <span className="required">*</span></label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName || ''}
              onChange={handleInputChange}
              placeholder="e.g., Rajesh Foods"
              className={formErrors.businessName ? 'input-error' : ''}
            />
            {formErrors.businessName && <span className="error-message">{formErrors.businessName}</span>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Enter address"
            />
          </div>
          <div className="form-group">
            <label>Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
              placeholder="10 digit number"
              className={formErrors.phoneNumber ? 'input-error' : ''}
            />
            {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="vendor@example.com"
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isOpen"
                checked={formData.isOpen || false}
                onChange={handleInputChange}
              />
              Currently Open
            </label>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      );
    }

    if (activeTab === 'snacks') {
      return (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? "Edit Snack" : "Add New Snack"}>
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., Samosa"
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Describe the snack..."
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                step="0.01"
                className={formErrors.price ? 'input-error' : ''}
              />
              {formErrors.price && <span className="error-message">{formErrors.price}</span>}
            </div>
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className={formErrors.category ? 'input-error' : ''}
              >
                <option value="">Select Category</option>
                <option value="Snacks">Snacks</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
              {formErrors.category && <span className="error-message">{formErrors.category}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable !== false}
                onChange={handleInputChange}
              />
              Is Available
            </label>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      );
    }

    return null;
  };

  const currentData =
    activeTab === 'vendors' ? vendors : activeTab === 'snacks' ? snacks : activeTab === 'orders' ? orders : printoutOrders;
  const currentColumns =
    activeTab === 'vendors' ? vendorColumns : activeTab === 'snacks' ? snacksColumns : activeTab === 'orders' ? ordersColumns : printoutColumns;

  const filteredData = currentData.filter((item) => {
    const searchableText =
      (item.businessName || item.name || item._id || '').toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="page lazypeeps-page">
      <div className="page-header">
        <h1>LazyPeeps Management</h1>
        <div className="header-actions">
          {activeTab !== 'orders' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add {activeTab === 'vendors' ? 'Vendor' : 'Snack'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          Vendors ({vendors.length})
        </button>
        <button
          className={`tab ${activeTab === 'snacks' ? 'active' : ''}`}
          onClick={() => setActiveTab('snacks')}
        >
          Snacks ({snacks.length})
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Snack Orders ({orders.length})
        </button>
        <button
          className={`tab ${activeTab === 'printout' ? 'active' : ''}`}
          onClick={() => setActiveTab('printout')}
        >
          Print Orders ({printoutOrders.length})
        </button>
      </div>

      {/* Search */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={`Search ${activeTab}...`} />

      {/* Printout Orders Table with Approve/Reject Actions */}
      {activeTab === 'printout' && !loading && (
        <div className="printout-orders-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {printoutColumns.map(col => (
                    <th key={col.key} style={{ width: col.width }}>{col.label}</th>
                  ))}
                  <th style={{ width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {printoutOrders.map(order => (
                  <tr key={order._id}>
                    {printoutColumns.map(col => (
                      <td key={col.key} style={{ width: col.width }}>
                        {col.render ? col.render(order[col.key]) : order[col.key]}
                      </td>
                    ))}
                    <td style={{ width: '200px' }}>
                      {order.status === 'pending' && (
                        <>
                          <button
                            className="btn-approve-small"
                            onClick={() => handleApprovePrintout(order._id, 'approved')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn-reject-small"
                            onClick={() => handleApprovePrintout(order._id, 'rejected')}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button
                          className="btn-status-small"
                          onClick={() => handleApprovePrintout(order._id, 'printing')}
                        >
                          📠 Start Print
                        </button>
                      )}
                      {order.status === 'printing' && (
                        <button
                          className="btn-status-small"
                          onClick={() => handleApprovePrintout(order._id, 'ready')}
                        >
                          ✓ Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <span className="status-delivered">Ready for pickup</span>
                      )}
                      {order.status === 'rejected' && (
                        <span className="status-rejected">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Table for Other Tabs */}
      {activeTab !== 'printout' && (
        <>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <DataTable
              columns={currentColumns}
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              rowsPerPage={15}
            />
          )}
        </>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default LazyPeeps;

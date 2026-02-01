// Application Constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const ENABLE_LOGS = import.meta.env.VITE_ENABLE_LOGS === 'true';

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
    ALPHA: 'alpha',
};

// Order Statuses
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};

// Listing Statuses
export const LISTING_STATUS = {
    ACTIVE: 'active',
    SOLD: 'sold',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    REJECTED: 'rejected',
};

// Assignment Statuses
export const ASSIGNMENT_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

// Payment Statuses
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

// Alpha Statuses
export const ALPHA_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected',
};

// Post Types
export const POST_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    POLL: 'poll',
    LINK: 'link',
};

// Story Types
export const STORY_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    TEXT: 'text',
};

// Listing Categories
export const LISTING_CATEGORIES = [
    'Books',
    'Electronics',
    'Clothing',
    'Furniture',
    'Sports',
    'Stationery',
    'Other',
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Chart Colors
export const CHART_COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
};

// Status Badge Colors
export const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#14b8a6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280',
    active: '#10b981',
    sold: '#6b7280',
    inactive: '#9ca3af',
    rejected: '#ef4444',
    open: '#3b82f6',
    in_progress: '#f59e0b',
    submitted: '#8b5cf6',
    completed: '#10b981',
    approved: '#10b981',
    failed: '#ef4444',
    verified: '#10b981',
    suspended: '#ef4444',
};

// API Endpoints
export const ENDPOINTS = {
    // Auth
    ADMIN_AUTH_SEND_OTP: '/admin-auth/otp/send',
    ADMIN_AUTH_VERIFY_OTP: '/admin-auth/otp/verify',

    // Dashboard
    DASHBOARD: '/admin/dashboard',

    // Orders
    ORDERS: '/admin/orders',
    ORDER_BY_ID: (id) => `/admin/orders/${id}`,
    UPDATE_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
    ASSIGN_ADMIN_TO_ORDER: (id) => `/admin/orders/${id}/assign`,

    // Payments
    PAYMENT_REQUESTS: '/admin/payments/requests',
    APPROVE_PAYMENT: (id) => `/admin/payments/requests/${id}/approve`,
    REJECT_PAYMENT: (id) => `/admin/payments/requests/${id}/reject`,
    RELEASE_SELLER_PAYMENT: (orderId) => `/admin/payments/release/seller/${orderId}`,
    RELEASE_ALPHA_PAYMENT: (assignmentId) => `/admin/payments/release/alpha/${assignmentId}`,

    // Marketplace
    ITEMS: '/admin/items',
    LISTINGS: '/listings',
    LISTING_BY_ID: (id) => `/listings/${id}`,
    MY_LISTINGS: '/listings/user/my',

    // Alphas
    ALPHAS: '/alphas',
    VERIFY_ALPHA: (id) => `/admin/alphas/${id}/verify`,
    SUSPEND_ALPHA: (id) => `/admin/alphas/${id}/suspend`,

    // Users
    USERS: '/users',
    USER_BY_ID: (id) => `/users/${id}`,

    // Community
    POSTS: '/community/posts',
    POST_BY_ID: (id) => `/community/posts/${id}`,
    POST_COMMENTS: (id) => `/community/posts/${id}/comments`,
    STORIES: '/community/stories',
    STORY_BY_ID: (id) => `/community/stories/${id}`,
    STORY_FEED: '/community/stories/feed',

    // Assignments
    ASSIGNMENTS: '/assignments',
    ASSIGNMENT_BY_ID: (id) => `/assignments/${id}`,
    ASSIGN_ALPHA: (id) => `/assignments/${id}/assign-alpha`,
    MY_ASSIGNMENTS: '/assignments/my',

    // Transactions
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id) => `/transactions/${id}`,

    // Cart
    CART: '/cart',
    CART_COUNT: '/cart/count',
};

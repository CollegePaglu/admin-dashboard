import axios from 'axios';
import { API_BASE_URL, ENABLE_LOGS } from '../config/constants';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (ENABLE_LOGS) {
            console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        if (ENABLE_LOGS) {
            console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (ENABLE_LOGS) {
            console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log error in development
        if (ENABLE_LOGS) {
            console.error('[API Response Error]', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
            });
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('adminRefreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/admin-auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('adminToken', accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminData');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 Forbidden - Insufficient permissions
        if (error.response?.status === 403) {
            console.error('Access denied: Insufficient permissions');
            // You can show a toast notification here
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error: Unable to reach server');
            // You can show a toast notification here
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API errors
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || 'An error occurred';
        const status = error.response.status;
        return { message, status, data: error.response.data };
    } else if (error.request) {
        // Request made but no response
        return { message: 'No response from server', status: 0 };
    } else {
        // Error in request setup
        return { message: error.message || 'Request failed', status: 0 };
    }
};

// API methods
export const api = {
    // GET request
    get: async (url, config = {}) => {
        try {
            const response = await apiClient.get(url, config);
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },

    // POST request
    post: async (url, data = {}, config = {}) => {
        try {
            const response = await apiClient.post(url, data, config);
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },

    // PUT request
    put: async (url, data = {}, config = {}) => {
        try {
            const response = await apiClient.put(url, data, config);
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },

    // PATCH request
    patch: async (url, data = {}, config = {}) => {
        try {
            const response = await apiClient.patch(url, data, config);
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },

    // DELETE request
    delete: async (url, config = {}) => {
        try {
            const response = await apiClient.delete(url, config);
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },

    // Upload file
    upload: async (url, formData, onProgress = null) => {
        try {
            const response = await apiClient.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });
            return { data: response.data, error: null };
        } catch (error) {
            return { data: null, error: handleApiError(error) };
        }
    },
    // Analytics
    analytics: {
        getOverview: () =>
            api.get('/analytics/admin/overview'),

        getUsers: (params) =>
            api.get('/analytics/admin/users', { params }),

        getUserDetail: (id) =>
            api.get(`/analytics/admin/users/${id}`),

        getUserRecommendations: (id) =>
            api.get(`/analytics/admin/users/${id}/recommendations`),

        getSocieties: (params) =>
            api.get('/analytics/admin/societies', { params }),

        getSocietyDetail: (id) =>
            api.get(`/analytics/admin/societies/${id}`),

        getPosts: (params) =>
            api.get('/analytics/admin/posts', { params }),

        getPostDetail: (id) =>
            api.get(`/analytics/admin/posts/${id}`),

        triggerUserAggregation: (id) =>
            api.post(`/analytics/admin/aggregate/user/${id}`),
    },
};

export default apiClient;

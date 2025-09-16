import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor để handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Auto redirect to login if 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't auto redirect, just log
      console.warn('Token expired or invalid. Please login again.');
    }

    return Promise.reject(error);
  }
);

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`)
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: (params) => api.get('/products/featured', { params }),
  getSimilar: (id, params) => api.get(`/products/${id}/similar`, { params }),
  getStats: (id) => api.get(`/products/${id}/stats`),
  getByType: (type, params) => api.get(`/products/type/${type}`, { params })
};

// Search API
export const searchAPI = {
  fuzzySearch: (params) => api.get('/search', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
  getFilterOptions: () => api.get('/search/filters'),
  incrementView: (productId) => api.post(`/search/view/${productId}`)
};

// Favorites API
export const favoritesAPI = {
  add: (productId) => api.post(`/favorites/${productId}`),
  remove: (productId) => api.delete(`/favorites/${productId}`),
  getAll: (params) => api.get('/favorites', { params }),
  checkStatus: (productId) => api.get(`/favorites/${productId}/status`),
  getCount: () => api.get('/favorites/count')
};

// View History API
export const viewHistoryAPI = {
  add: (productId) => api.post(`/view-history/${productId}`),
  getAll: (params) => api.get('/view-history', { params }),
  remove: (productId) => api.delete(`/view-history/${productId}`),
  clear: () => api.delete('/view-history'),
  getMostViewed: (params) => api.get('/view-history/most-viewed', { params })
};

// Comments API
export const commentsAPI = {
  create: (productId, data) => api.post(`/comments/product/${productId}`, data),
  getByProduct: (productId, params) => api.get(`/comments/product/${productId}`, { params }),
  update: (commentId, data) => api.put(`/comments/${commentId}`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
  getUserComments: (params) => api.get('/comments/my', { params })
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile')
};

export default api;

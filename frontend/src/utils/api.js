import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  getFeatured: (params) => api.get('/products/featured', { params })
};

// Search API
export const searchAPI = {
  fuzzySearch: (params) => api.get('/search', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
  getFilterOptions: () => api.get('/search/filters'),
  incrementView: (productId) => api.post(`/search/view/${productId}`)
};

export default api;

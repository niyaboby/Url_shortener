import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// URLs
export const urlAPI = {
  shorten: (data) => api.post('/url/shorten', data),
  getAll: () => api.get('/url/user/all'),
  getOne: (id) => api.get(`/url/${id}`),
  update: (id, data) => api.put(`/url/${id}`, data),
  delete: (id) => api.delete(`/url/${id}`),
  dashboardAnalytics: () => api.get('/url/user/analytics'),
};

// Analytics
export const analyticsAPI = {
  getForUrl: (urlId) => api.get(`/analytics/${urlId}`),
};

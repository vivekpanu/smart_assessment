import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if  it exists
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is due to expired token and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear the expired token
      localStorage.removeItem('token');
      
      // Redirect to login or show a message
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
        alert('Your session has expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  async register(name: string, email: string, password: string, role: 'student' | 'teacher') {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role
    });
    return response.data;
  },

  async login(email: string, password: string, role: 'student' | 'teacher') {
    const response = await api.post('/auth/login', {
      email,
      password,
      role
    });
    return response.data;
  }
};

export default api;
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
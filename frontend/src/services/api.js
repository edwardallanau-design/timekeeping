import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// TimeLog services
export const timeLogService = {
  timeIn: () => api.post('/timelog/time-in'),
  timeOut: () => api.post('/timelog/time-out'),
  getDailyLog: (date) => api.get('/timelog/daily', { params: { date } }),
  getMonthlyAttendance: (year, month) => 
    api.get('/timelog/monthly', { params: { year, month } }),
  getYearlyStats: (year) => 
    api.get('/timelog/yearly', { params: { year } })
};

export default api;

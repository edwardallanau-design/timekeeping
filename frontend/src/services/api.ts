import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TimeLogDto,
  DailyLogResponse,
  MonthlyAttendanceResponse,
  MeResponse,
  DevTimeRequest,
} from '../types';

const API_URL = 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  getMe: () =>
    api.get<MeResponse>('/auth/me'),
};

export const timeLogService = {
  timeIn: () =>
    api.post<TimeLogDto>('/timelog/time-in'),

  timeInWithTimezone: (timezone: string) =>
    api.post<TimeLogDto>('/timelog/time-in', { timezone }),

  timeInWithDateTime: (data: DevTimeRequest) =>
    api.post<TimeLogDto>('/timelog/time-in', data),

  timeOut: () =>
    api.post<TimeLogDto>('/timelog/time-out'),

  timeOutWithTimezone: (timezone: string) =>
    api.post<TimeLogDto>('/timelog/time-out', { timezone }),

  timeOutWithDateTime: (data: DevTimeRequest) =>
    api.post<TimeLogDto>('/timelog/time-out', data),

  timeInCustom: (data: DevTimeRequest) =>
    api.post<TimeLogDto>('/dev/timelog/time-in', data),

  timeOutCustom: (data: DevTimeRequest) =>
    api.post<TimeLogDto>('/dev/timelog/time-out', data),

  deleteTimeLog: (date: string) =>
    api.delete<void>(`/dev/timelog/${date}`),

  getDailyLog: (date?: string) =>
    api.get<DailyLogResponse>('/timelog/daily', { params: { date } }),

  getMonthlyAttendance: (year: number, month: number) =>
    api.get<MonthlyAttendanceResponse>('/timelog/monthly', { params: { year, month } }),

  getYearlyStats: (year: number) =>
    api.get<unknown>('/timelog/yearly', { params: { year } }),
};

export default api;

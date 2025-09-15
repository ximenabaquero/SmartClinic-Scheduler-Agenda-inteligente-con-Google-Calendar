import axios from 'axios';
import { AuthResponse, User, Appointment } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { email, password, firstName, lastName });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const appointmentService = {
  async getAppointments(status?: string): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: { status } });
    return response.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async createAppointmentRequest(data: any): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async confirmAppointment(id: string, scheduledAt: string, notes?: string): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}/confirm`, { scheduledAt, notes });
    return response.data;
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export const calendarService = {
  async getAuthUrl(): Promise<{ authUrl: string }> {
    const response = await api.get('/calendar/auth-url');
    return response.data;
  },

  async connectCalendar(code: string): Promise<{ success: boolean }> {
    const response = await api.post('/calendar/connect', null, { params: { code } });
    return response.data;
  },

  async syncCalendar(): Promise<any[]> {
    const response = await api.post('/calendar/sync');
    return response.data;
  },

  async getFreeBusy(timeMin: string, timeMax: string): Promise<any[]> {
    const response = await api.get('/calendar/free-busy', { params: { timeMin, timeMax } });
    return response.data;
  },
};

export default api;
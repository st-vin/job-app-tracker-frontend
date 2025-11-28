import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
  CheckEmailExistsResponse,
  User,
} from '../types/auth.types';
import {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  UpdateApplicationStatusRequest,
  DashboardStats,
  PaginatedApplications,
  ApplicationSearchResult,
} from '../types/application.types';
import { Reminder, CreateReminderRequest, UpdateReminderRequest } from '../types/reminder.types';
import { InterviewNote, CreateNoteRequest } from '../types/note.types';

const API_BASE_URL = 'http://localhost:8080';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('job_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('job_tracker_token');
      localStorage.removeItem('job_tracker_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ============ AUTHENTICATION API ============

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post('/api/users/register', data).then((res) => res.data),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/api/auth/login', data).then((res) => res.data),

  verifyEmail: (token: string): Promise<VerifyEmailResponse> =>
    apiClient.get(`/api/auth/verify?token=${token}`).then((res) => res.data),

  resendVerification: (email: string): Promise<ResendVerificationResponse> =>
    apiClient.post(`/api/auth/resend-verification?email=${email}`).then((res) => res.data),

  checkEmailExists: (email: string): Promise<CheckEmailExistsResponse> =>
    apiClient.get(`/api/users/exists?email=${email}`).then((res) => res.data),
};

// ============ DASHBOARD API ============

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/api/dashboard/stats').then((res) => res.data),
};

// ============ APPLICATIONS API ============

export const applicationsApi = {
  getAll: (): Promise<Application[]> =>
    apiClient.get('/api/applications/me').then((res) => res.data),

  getPaginated: (page: number = 0, size: number = 10): Promise<PaginatedApplications> =>
    apiClient.get(`/api/applications/me/paginated?page=${page}&size=${size}`).then((res) => res.data),

  getById: (id: number): Promise<Application> =>
    apiClient.get(`/api/applications/${id}`).then((res) => res.data),

  create: (data: CreateApplicationRequest): Promise<Application> =>
    apiClient.post('/api/applications', data).then((res) => res.data),

  update: (id: number, data: UpdateApplicationRequest): Promise<Application> =>
    apiClient.put(`/api/applications/${id}`, data).then((res) => res.data),

  updateStatus: (id: number, data: UpdateApplicationStatusRequest): Promise<Application> =>
    apiClient.patch(`/api/applications/${id}/status`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/applications/${id}`).then((res) => res.data),

  search: (keyword: string): Promise<ApplicationSearchResult> =>
    apiClient.get(`/api/applications/search?keyword=${keyword}`).then((res) => res.data),

  filter: (params: {
    status?: string[];
    minSalary?: number;
    maxSalary?: number;
  }): Promise<Application[]> => {
    const queryParams = new URLSearchParams();
    if (params.status?.length) {
      params.status.forEach((s) => queryParams.append('status', s));
    }
    if (params.minSalary !== undefined) {
      queryParams.append('minSalary', params.minSalary.toString());
    }
    if (params.maxSalary !== undefined) {
      queryParams.append('maxSalary', params.maxSalary.toString());
    }
    return apiClient.get(`/api/applications/filter?${queryParams.toString()}`).then((res) => res.data);
  },

  getByStatus: (status: string): Promise<Application[]> =>
    apiClient.get(`/api/applications/status/${status}`).then((res) => res.data),
};

// ============ REMINDERS API ============

export const remindersApi = {
  getAll: (): Promise<Reminder[]> =>
    apiClient.get('/api/reminders').then((res) => res.data),

  getByApplicationId: (applicationId: number): Promise<Reminder[]> =>
    apiClient.get(`/api/reminders/application/${applicationId}`).then((res) => res.data),

  create: (applicationId: number, data: CreateReminderRequest): Promise<Reminder> =>
    apiClient.post(`/api/reminders/application/${applicationId}`, data).then((res) => res.data),

  update: (id: number, data: UpdateReminderRequest): Promise<Reminder> =>
    apiClient.put(`/api/reminders/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/reminders/${id}`).then((res) => res.data),
};

// ============ INTERVIEW NOTES API ============

export const notesApi = {
  getByApplicationId: (applicationId: number): Promise<InterviewNote[]> =>
    apiClient.get(`/api/notes/application/${applicationId}`).then((res) => res.data),

  create: (applicationId: number, data: CreateNoteRequest): Promise<InterviewNote> =>
    apiClient.post(`/api/notes/application/${applicationId}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/notes/${id}`).then((res) => res.data),
};

// ============ USERS API ============

export const usersApi = {
  getAll: (): Promise<User[]> =>
    apiClient.get('/api/users').then((res) => res.data),

  getById: (id: number): Promise<User> =>
    apiClient.get(`/api/users/${id}`).then((res) => res.data),

  getByEmail: (email: string): Promise<User> =>
    apiClient.get(`/api/users/email/${email}`).then((res) => res.data),

  update: (id: number, data: Partial<User>): Promise<User> =>
    apiClient.put(`/api/users/${id}`, data).then((res) => res.data),

  changePassword: (
    id: number,
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> => apiClient.post(`/api/users/${id}/password`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/users/${id}`).then((res) => res.data),
};

export default apiClient;

import axiosClient, { api } from './axiosClient';
import { ApiUser, AuthUser, TokenResponse, UserRole } from '@/types/auth';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  employee_id: string;
  name: string;
  department: string;
  password: string;
  role?: UserRole;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<TokenResponse>('/api/v1/auth/login', payload),
  signup: (payload: SignupPayload) => api.post<ApiUser>('/api/v1/auth/signup', payload),
  me: () => api.get<ApiUser>('/api/v1/auth/me'),
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('auth_token', token);
  // axiosClient will pick up accessToken via interceptor
  axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user_info');
  delete axiosClient.defaults.headers.common.Authorization;
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('user_info');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed;
  } catch (e) {
    console.error('Failed to parse user_info from storage', e);
    return null;
  }
};

export const getRoleLabel = (role?: UserRole) => {
  if (!role) return '';
  const map: Record<UserRole, string> = {
    CONSULTANT: '상담사',
    REVIEWER: '검토자',
    ADMIN: '관리자',
  };
  return map[role] ?? role;
};

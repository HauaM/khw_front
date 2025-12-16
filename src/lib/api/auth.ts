import { ApiResponse } from '@/types/api';
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
  login: (payload: LoginPayload) => api.post<ApiResponse<TokenResponse>>('/api/v1/auth/login', payload),
  signup: (payload: SignupPayload) => api.post<ApiResponse<ApiUser>>('/api/v1/auth/signup', payload),
  me: () => api.get<ApiResponse<ApiUser>>('/api/v1/auth/me'),
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

/**
 * JWT 토큰에서 사용자 UUID를 추출합니다
 * 토큰 구조: Header.Payload.Signature
 * Payload에서 'sub' 필드를 추출합니다 (일반적으로 사용자 UUID)
 *
 * @returns 사용자 UUID 또는 null
 */
export const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    // JWT는 3개 부분으로 나뉨: Header.Payload.Signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Payload 부분을 Base64로 디코드
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    // 'sub' 필드에서 사용자 ID (UUID) 추출
    // sub는 JWT의 표준 claim으로 주로 사용자를 나타냄
    const userId = decoded.sub || decoded.user_id || decoded.id;
    return userId || null;
  } catch (error) {
    console.error('Failed to extract user ID from token:', error);
    return null;
  }
};

/**
 * 현재 로그인한 사용자의 employee_id를 가져옵니다
 * 메뉴얼 검토 Task 승인/반려 시 사용됩니다.
 * 다음 순서로 시도합니다:
 * 1. localStorage의 user_info에서 employee_id 찾기
 * 2. 저장된 토큰에서 user UUID 추출
 *
 * @returns 사용자의 employee_id (문자열) 또는 null
 */
export const getCurrentReviewerId = (): string | null => {
  // 방법 1: 저장된 user_info에서 employee_id 가져오기 (UUID 대체로 사용)
  const user = getStoredUser();
  if (user && user.employee_id) {
    return user.employee_id;
  }

  // 방법 2: 토큰에서 employee_id 추출
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.employee_id) {
          return payload.employee_id;
        }
      }
    }
  } catch (error) {
    console.error('Failed to extract employee_id from token:', error);
  }

  return null;
};

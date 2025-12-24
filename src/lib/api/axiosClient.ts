import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, API_ERROR_CODES } from '@/types/api';
import { axiosErrorToApiError } from './responseHandler';

// API 기본 URL (환경변수로 관리)
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const responseData = response.data as ApiResponse<any>;

    // API 공통 규격에서 에러가 있으면 에러로 처리
    if (!responseData.success && responseData.error) {
      const apiError = axiosErrorToApiError(
        new AxiosError('API Error', '', response.config, response.request, response)
      );

      if (apiError) {
        return Promise.reject(apiError);
      }
    }

    // 원본 응답 객체를 반환하여 기존 코드 호환성 유지
    return response as any;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // API 공통 규격 에러 응답 확인
    const apiError = axiosErrorToApiError(error);
    if (apiError) {
      // 인증 토큰 관련 에러
      const errorCode = apiError.error.code;

      if (
        (errorCode === API_ERROR_CODES.AUTH_EXPIRED_TOKEN ||
          errorCode === API_ERROR_CODES.AUTH_INVALID_TOKEN) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // 리프레시 토큰으로 새로운 액세스 토큰 발급
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      }

      // 권한 없음
      if (errorCode === API_ERROR_CODES.AUTH_FORBIDDEN) {
        // 권한 없음 페이지로 리다이렉트 또는 알림 표시 (토스트로 처리)
      }

      return Promise.reject(apiError);
    }

    // API 공통 규격이 아닌 일반 HTTP 에러
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      // 토큰 만료 재시도 로직
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    if (status === 403) {
      // 권한 없음 처리
    }

    if (status === 404) {
      // 리소스 없음 처리
    }

    if (status === 500) {
      // 서버 오류 처리
    }

    return Promise.reject(error);
  }
);

// API 호출 헬퍼 함수들
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosClient.delete<T>(url, config).then((res) => res.data),
};

export default axiosClient;

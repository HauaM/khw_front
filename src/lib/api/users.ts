// User Management API Layer
import type { ApiResponse } from '@/types/api';
import type {
  UserCreatePayload,
  UserListParams,
  UserListResponse,
  UserResponse,
  UserUpdatePayload,
} from '@/types/users';
import { api } from './axiosClient';

/**
 * 사용자 목록 조회
 * GET /api/v1/users
 */
export const getUsers = (params?: UserListParams) =>
  api.get<ApiResponse<UserListResponse>>('/api/v1/users', { params });

/**
 * 사용자 등록
 * POST /api/v1/users
 */
export const createUser = (payload: UserCreatePayload) =>
  api.post<ApiResponse<UserResponse>>('/api/v1/users', payload);

/**
 * 사용자 정보 수정
 * PUT /api/v1/users/{user_id}
 */
export const updateUser = (userId: number, payload: UserUpdatePayload) =>
  api.put<ApiResponse<UserResponse>>(`/api/v1/users/${userId}`, payload);

/**
 * 사용자 삭제
 * DELETE /api/v1/users/{user_id}
 */
export const deleteUser = (userId: number) =>
  api.delete(`/api/v1/users/${userId}`);

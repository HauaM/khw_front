import type { ApiResponse } from '@/types/api';
import type { DepartmentResponse } from '@/types/users';
import { api } from './axiosClient';

/**
 * 부서 목록 조회 (관리자)
 * GET /api/v1/admin/departments
 */
export const getDepartments = (params?: {
  is_active?: boolean;
  department_code?: string;
  department_name?: string;
}) => api.get<ApiResponse<DepartmentResponse[]>>('/api/v1/admin/departments', { params });

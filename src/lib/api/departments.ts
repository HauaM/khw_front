import type { ApiResponse } from '@/types/api';
import type { DepartmentResponse } from '@/types/users';
import { api } from './axiosClient';

/**
 * 부서 목록 조회 (관리자)
 * GET /api/v1/admin/departments
 */
export const getDepartments = async (params?: {
  is_active?: boolean;
  department_code?: string;
  department_name?: string;
}) => {
  const response = await api.get<ApiResponse<DepartmentResponse[]>>('/api/v1/admin/departments', { params });
  return response.data;
};

/**
 * 부서 생성
 * POST /api/v1/admin/departments
 */
export const createDepartment = async (data: {
  department_code: string;
  department_name: string;
  is_active?: boolean;
}) => {
  const response = await api.post<ApiResponse<DepartmentResponse>>('/api/v1/admin/departments', data);
  return response.data;
};

/**
 * 부서 수정
 * PUT /api/v1/admin/departments/{department_id}
 *
 * @param id - 부서 ID (UUID)
 * @param data - 수정할 부서 정보 (DepartmentUpdate)
 */
export const updateDepartment = async (id: string, data: {
  department_code: string;
  department_name: string;
  is_active?: boolean;
}) => {
  const response = await api.put<ApiResponse<DepartmentResponse>>(`/api/v1/admin/departments/${id}`, data);
  return response.data;
};

/**
 * 부서 삭제
 * DELETE /api/v1/admin/departments/{department_id}
 *
 * @param id - 부서 ID (UUID)
 * @returns 204 No Content
 */
export const deleteDepartment = (id: string) => api.delete(`/api/v1/admin/departments/${id}`);

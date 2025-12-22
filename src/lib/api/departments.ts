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
}) => api.get<DepartmentResponse[]>('/api/v1/admin/departments', { params });

/**
 * 부서 생성
 * POST /api/v1/admin/departments
 */
export const createDepartment = (data: {
  department_code: string;
  department_name: string;
  is_active?: boolean;
}) => api.post<DepartmentResponse>('/api/v1/admin/departments', data);

/**
 * 부서 수정
 * PUT /api/v1/admin/departments/{department_id}
 *
 * @param id - 부서 ID (UUID)
 * @param data - 수정할 부서 정보 (DepartmentUpdate)
 */
export const updateDepartment = (id: string, data: {
  department_code: string;
  department_name: string;
  is_active?: boolean;
}) => api.put<DepartmentResponse>(`/api/v1/admin/departments/${id}`, data);

/**
 * 부서 삭제
 * DELETE /api/v1/admin/departments/{department_id}
 *
 * @param id - 부서 ID (UUID)
 * @returns 204 No Content
 */
export const deleteDepartment = (id: string) => api.delete(`/api/v1/admin/departments/${id}`);

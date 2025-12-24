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
}): Promise<ApiResponse<DepartmentResponse[]>> => {
  // api.get()이 이미 .then((res) => res.data)를 수행하므로 response가 곧 ApiResponse
  const response = await api.get<ApiResponse<DepartmentResponse[]>>('/api/v1/admin/departments', { params });
  return response as unknown as ApiResponse<DepartmentResponse[]>;
};

/**
 * 부서 생성
 * POST /api/v1/admin/departments
 */
export const createDepartment = async (data: {
  department_code: string;
  department_name: string;
  is_active?: boolean;
}): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.post<ApiResponse<DepartmentResponse>>('/api/v1/admin/departments', data);
  return response as unknown as ApiResponse<DepartmentResponse>;
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
}): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.put<ApiResponse<DepartmentResponse>>(`/api/v1/admin/departments/${id}`, data);
  return response as unknown as ApiResponse<DepartmentResponse>;
};

/**
 * 부서 삭제
 * DELETE /api/v1/admin/departments/{department_id}
 *
 * @param id - 부서 ID (UUID)
 * @returns 204 No Content or ApiResponse
 */
export const deleteDepartment = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/api/v1/admin/departments/${id}`);
  // DELETE는 204 No Content일 수 있으므로, 빈 응답이면 success 객체를 생성
  if (!response || typeof response !== 'object' || !('success' in response)) {
    return {
      success: true,
      data: null,
      error: null,
      meta: {
        requestId: '',
        timestamp: new Date().toISOString(),
      },
      feedback: [],
    };
  }
  return response as unknown as ApiResponse<null>;
};

/**
 * 부서 관리 타입 정의
 */

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  department_code: string;
  department_name: string;
  parent_department_code?: string | null;
  parent_department_name?: string | null;
  status: DepartmentStatus;
  created_at: string; // ISO string
  updated_at?: string; // ISO string
}

export interface DepartmentSearchParams {
  query?: string; // 부서명 또는 부서코드 검색
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  page?: number;
  page_size?: number;
}

export interface PagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface DepartmentFormData {
  department_code: string;
  department_name: string;
  parent_department_code?: string;
  status: DepartmentStatus;
}

export interface DepartmentFormErrors {
  department_code?: string;
  department_name?: string;
  parent_department_code?: string;
}
// User Management Types

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'REVIEWER';
export type UserSortBy = 'employee_id' | 'name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface DepartmentResponse {
  id: string;
  department_code: string;
  department_name: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: number;
  employee_id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  departments: DepartmentResponse[];
}

export interface UserListResponse {
  items: UserResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserListParams {
  employee_id?: string;
  name?: string;
  department_code?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: UserSortBy;
  sort_order?: SortOrder;
}

export interface UserSearchFormParams {
  employee_id?: string;
  name?: string;
  role?: UserRole | '';
  is_active?: '' | 'true' | 'false';
  department_code?: string;
  page?: number;
  page_size?: number;
  sort_by?: UserSortBy;
  sort_order?: SortOrder;
}

export interface UserCreatePayload {
  employee_id: string;
  name: string;
  role?: UserRole;
  is_active?: boolean;
  password: string;
  department_ids: string[];
  primary_department_id?: string | null;
}

export interface UserUpdatePayload {
  name?: string | null;
  role?: UserRole | null;
  is_active?: boolean | null;
  password?: string | null;
  department_ids?: string[] | null;
  primary_department_id?: string | null;
}

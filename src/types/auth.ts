export type UserRole = 'CONSULTANT' | 'REVIEWER' | 'ADMIN';

export interface LoginFormValues {
  employee_id: string;
  password: string;
}

export interface RegisterFormValues {
  employee_id: string;
  name: string;
  department: string;
  department_ids: string[];
  role: UserRole | '';
  password: string;
  password_confirm: string;
}

export interface AuthUser {
  employee_id: string;
  name: string;
  department: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiUser {
  username: string;
  employee_id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  id: number;
  created_at: string;
  updated_at: string;
  departments?: Array<{
    id: string;
    department_code: string;
    department_name: string;
    is_active?: boolean;
  }>;
}

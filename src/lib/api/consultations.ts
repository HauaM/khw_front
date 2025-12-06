import { api } from './axiosClient';

export type BusinessType =
  | 'DEPOSIT'
  | 'LOAN'
  | 'CARD'
  | 'EXCHANGE'
  | 'INTERNET'
  | 'MOBILE'
  | 'OTHER'
  | string;

export interface Consultation {
  id: string;
  branch_code: string;
  branch_name: string;
  employee_id: string;
  employee_name: string;
  screen_id: string;
  transaction_name: string;
  business_type: BusinessType;
  error_code: string;
  inquiry_text: string;
  action_taken: string;
  created_at: string;
  metadata_fields: Record<string, string>;
}

export interface ConsultationCreatePayload {
  summary: string;
  inquiry_text: string;
  action_taken: string;
  branch_code: string;
  employee_id: string;
  screen_id?: string | null;
  transaction_name?: string | null;
  business_type?: BusinessType | null;
  error_code?: string | null;
  metadata_fields?: Record<string, string>;
}

export interface ConsultationResponse {
  id: string;
  created_at: string;
  updated_at: string;
  summary: string;
  inquiry_text: string;
  action_taken: string;
  branch_code: string;
  employee_id: string;
  screen_id?: string | null;
  transaction_name?: string | null;
  business_type?: BusinessType | null;
  error_code?: string | null;
  metadata_fields?: Record<string, string>;
  manual_entry_id?: string | null;
}

export const createConsultation = (payload: ConsultationCreatePayload) =>
  api.post<ConsultationResponse>('/api/v1/consultations', payload);

export const getConsultationById = (id: string) =>
  api.get<Consultation>(`/api/v1/consultations/${id}`);

import { ApiResponse } from '@/types/api';
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
  consultation_date?: string | null;
}

/**
 * 상담 생성 API
 * @returns ApiResponse<ConsultationResponse>
 */
export const createConsultation = (payload: ConsultationCreatePayload) =>
  api.post<ApiResponse<ConsultationResponse>>('/api/v1/consultations', payload);

/**
 * 상담 상세 조회 API
 * @returns ApiResponse<Consultation>
 */
export const getConsultationById = (id: string) =>
  api.get<ApiResponse<Consultation>>(`/api/v1/consultations/${id}`);

/**
 * 상담 원본 상세 정보 조회 (승인된 메뉴얼 모달용)
 * GET /api/v1/consultations/{consultation_id}
 *
 * @param consultationId - 상담 ID (UUID)
 * @returns ConsultationDetail
 */
const MOCK_CONSULTATION_DETAIL_BASE: Omit<ConsultationResponse, 'id'> = {
  created_at: '2025-12-09T15:30:00Z',
  updated_at: '2025-12-09T16:00:00Z',
  summary: '로그인 오류로 인한 고객 문의',
  inquiry_text: '인터넷뱅킹 로그인 시 E001 오류가 발생합니다. 비밀번호는 정확한데 계속 실패합니다.',
  action_taken: '1. 고객 계정 상태 확인 완료\n2. 서버 장애 이력 확인\n3. 임시 조치 완료 및 고객 안내',
  branch_code: '0001',
  employee_id: 'EMP-0001',
  screen_id: null,
  transaction_name: null,
  business_type: 'INTERNET',
  error_code: 'E001',
  metadata_fields: {},
  manual_entry_id: null,
  consultation_date: '2025-12-09T15:30:00Z',
};

const createMockConsultationResponse = (consultationId: string): ApiResponse<ConsultationResponse> => ({
  success: true,
  data: {
    ...MOCK_CONSULTATION_DETAIL_BASE,
    id: consultationId,
  },
  error: null,
  meta: {
    requestId: `mock-consultation-${consultationId}`,
    timestamp: new Date().toISOString(),
  },
  feedback: [],
});

export const getConsultationDetail = async (consultationId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return createMockConsultationResponse(consultationId);
};

export type { ConsultationDetail } from '@/types/consultations';

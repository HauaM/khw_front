export type BusinessType =
  | 'DEPOSIT'
  | 'LOAN'
  | 'CARD'
  | 'EXCHANGE'
  | 'INTERNET'
  | 'MOBILE'
  | 'OTHER';

export interface Consultation {
  id: string;
  branchCode: string;
  branchName?: string;
  employeeId?: string;
  employeeName?: string;
  screenId?: string;
  transactionName?: string;
  businessType: BusinessType;
  errorCode: string;
  inquiryText: string;
  summary?: string;
  actionTaken?: string;
  similarityScore: number;
  createdAt: string; // ISO string
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ConsultationSearchParams {
  query: string;
  businessType?: BusinessType | '';
  branchCode?: string;
  errorCode?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  itemsPerPage?: number;
}

/**
 * 상담 원본 상세 정보
 * 승인된 메뉴얼의 "상담 원본 보기" 모달에서 사용
 */
export interface ConsultationDetail {
  id: string;
  summary: string;
  inquiry: string;
  action: string;
  created_at: string;
  updated_at?: string;
  consultation_date?: string;
  branch_code?: string;
  employee_id?: string;
  business_type?: BusinessType | null;
  error_code?: string | null;
  metadata_fields?: Record<string, string>;
}

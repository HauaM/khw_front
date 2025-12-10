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

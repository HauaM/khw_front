/**
 * 메뉴얼 검토 Task 관련 타입 정의
 */

export type ManualReviewStatus = "TODO" | "IN_PROGRESS" | "DONE" | "REJECTED";

export type BusinessType =
  | "인터넷뱅킹"
  | "모바일뱅킹"
  | "대출"
  | "예금"
  | "카드";

/**
 * 백엔드 API의 ManualReviewTaskResponse (openapi.json)
 * @see /api/v1/manual-review/tasks endpoint
 */
export interface BackendManualReviewTask {
  id: string; // uuid
  created_at: string; // date-time
  updated_at: string; // date-time
  old_entry_id: string | null; // uuid or null
  new_entry_id: string; // uuid
  similarity: number;
  status: ManualReviewStatus;
  reviewer_id: string | null; // employee_id or null
  review_notes: string | null;
  old_manual_summary?: string | null;
  new_manual_summary?: string | null;
  diff_text?: string | null;
  diff_json?: Record<string, unknown> | null;
}

/**
 * 프론트엔드에서 사용하는 ManualReviewTask
 * 백엔드 API 응답을 변환하여 UI와 호환성 유지
 */
export interface ManualReviewTask {
  task_id: string; // id를 task_id로 매핑
  draft_manual_id: string; // new_entry_id를 draft_manual_id로 매핑
  existing_manual_id: string; // old_entry_id를 existing_manual_id로 매핑
  status: ManualReviewStatus;
  created_at: string; // ISO datetime string
  // 테이블 표시용 필드
  new_manual_topic?: string; // 신규 초안의 주제
  new_manual_keywords?: string[]; // 신규 초안 키워드
  business_type_name?: string; // 업무구분 이름
  new_error_code?: string; // 신규 초안의 에러코드
  source_consultation_id?: string | null;
  // 기존 필드 (하위호환성)
  business_type?: BusinessType;
  // 추가 필드 (API에서 제공)
  similarity?: number;
  reviewer_id?: string | null;
  review_notes?: string | null;
  old_manual_summary?: string | null;
  new_manual_summary?: string | null;
  diff_text?: string | null;
  diff_json?: Record<string, unknown> | null;
}

export interface ManualReviewTaskFilters {
  status: "전체" | ManualReviewStatus;
  businessType: "전체" | BusinessType;
  startDate: string; // "YYYY-MM-DD" or ""
  endDate: string;   // "YYYY-MM-DD" or ""
}

export interface ManualReviewTaskQueryParams {
  status?: ManualReviewStatus;
  business_type?: BusinessType;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface ManualReviewTasksResponse {
  data: ManualReviewTask[];
  total: number;
  page: number;
  limit: number;
}

export interface UseManualReviewTasksResult {
  data: ManualReviewTask[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 메뉴얼 엔트리 정보 (OpenAPI ManualEntryResponse 기반)
 */
export interface ManualEntry {
  id: string; // uuid
  keywords: string[];
  topic: string;
  background: string;
  guideline: string;
  business_type?: string | null;
  error_code?: string | null;
  source_consultation_id: string; // uuid
  version_id?: string | null; // uuid
  status: "DRAFT" | "APPROVED" | "DEPRECATED";
  created_at?: string;
  updated_at?: string;
}

/**
 * 메뉴얼 검토 상세 정보
 * OpenAPI ManualReviewTaskResponse 기반
 * 기존 메뉴얼과 신규 초안을 비교하는 데이터
 */
export interface ManualReviewDetail {
  task_id: string; // id (uuid)
  status: ManualReviewStatus;
  created_at?: string; // ISO datetime string
  updated_at?: string;
  // 비교 대상
  old_entry_id?: string | null; // uuid or null
  new_entry_id: string; // uuid
  similarity: number;
  // 검토자 정보
  reviewer_id?: string | null; // employee_id or null
  review_notes?: string | null;
  // AI 생성 요약
  old_manual_summary?: string | null; // 기존 메뉴얼 요약
  new_manual_summary?: string | null; // 신규 초안 요약
  diff_text?: string | null; // LLM 비교 결과 요약
  diff_json?: Record<string, unknown> | null; // LLM 비교 결과 JSON
  // UI 표시용 추가 필드 (선택적 - API 조회 후 병합)
  old_manual?: ManualEntry;
  new_manual?: ManualEntry;
  business_type?: BusinessType;
  reviewer?: string; // 검토자 이름
}

export interface UseManualReviewDetailResult {
  data: ManualReviewDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 메뉴얼 비교 타입 (similar, supplement, new)
 */
export type ComparisonType = "similar" | "supplement" | "new";

/**
 * 메뉴얼 검토 비교 데이터 (단일 상세 조회용)
 * 백엔드 API: GET /api/v1/manual-review/tasks/{taskId}
 *
 * 이 타입은 API 공통 규격을 따르는 새로운 상세 조회 엔드포인트를 위한 타입입니다.
 * 기존 ManualReviewDetail 대신 사용하며, 백엔드에서 조합된 데이터를 받습니다.
 */
export interface ManualReviewComparison {
  /** 비교 유형 */
  comparison_type: ComparisonType;
  /** 신규 초안 정보 */
  draft_entry: ManualEntry;
  /** 기존 메뉴얼 정보 (없으면 null) */
  existing_manual: ManualEntry | null;
  /** 유사도 점수 (0.0 ~ 1.0) */
  similarity_score: number;
  /** 검토 Task ID */
  review_task_id: string | null;
  /** 검토 상태 */
  status: ManualReviewStatus;
  /** 검토자 ID */
  reviewer_id?: string | null;
  /** 검토 노트 */
  review_notes?: string | null;
  /** 생성 시간 */
  created_at?: string;
  /** 업데이트 시간 */
  updated_at?: string;
}

// OpenAPI: ManualStatus enum
export type ManualDraftStatus = 'DRAFT' | 'APPROVED' | 'DEPRECATED';

/**
 * 메뉴얼 초안 데이터 모델
 * OpenAPI: ManualDraftResponse를 기반으로 함
 *
 * 주의: OpenAPI의 guideline은 문자열이지만,
 * 프론트엔드에서는 배열로 관리합니다.
 * API 호출 시에는 문자열로 변환됩니다.
 */
export interface ManualDraft {
  id: string;
  status: ManualDraftStatus;
  keywords: string[];
  topic: string;
  background: string;
  guideline: string[]; // UI: 배열, API: 줄바꿈으로 구분된 문자열
  created_at?: string;
  updated_at?: string;
  source_consultation_id?: string;
}

/**
 * 메뉴얼 초안 업데이트 요청
 * guideline을 줄바꿈으로 구분된 문자열로 변환하여 전송합니다.
 */
export interface ManualDraftUpdateRequest {
  topic: string;
  keywords: string[];
  background: string;
  guideline: string; // 줄바꿈으로 구분된 문자열
}

/**
 * 메뉴얼 검토 요청
 * OpenAPI: POST /api/v1/manuals/{manual_id}/review
 */
export interface ManualReviewRequest {
  // manual_id는 URL 경로에 포함되므로 request body에는 포함되지 않음
}

/**
 * OpenAPI로부터의 ManualDraftResponse 타입
 * API 응답 직렬화용
 */
export interface ManualDraftResponse {
  id: string;
  status: ManualDraftStatus;
  keywords: string[];
  topic: string;
  background: string;
  guideline: string; // API 응답: 문자열
  source_consultation_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 메뉴얼 검색 - 업무 구분 타입
 * OpenAPI: BusinessType enum
 */
export type ManualBusinessType = '' | '인터넷뱅킹' | '모바일뱅킹' | '대출' | '예금' | '카드';

/**
 * 메뉴얼 검색 파라미터
 * OpenAPI: GET /api/v1/manuals/search query parameters
 */
export interface ManualSearchParams {
  query: string; // 검색 쿼리 (required)
  business_type?: string | null; // 업무 구분 (optional)
  error_code?: string | null; // 에러 코드 (optional)
  status?: ManualDraftStatus | null; // 메뉴얼 상태 (optional)
  top_k?: number; // 반환할 최대 결과 수 (default 10)
  similarity_threshold?: number; // 유사도 임계값 (default 0.7)
}

/**
 * 메뉴얼 검색 결과 항목
 * OpenAPI: ManualSearchResult schema
 * {
 *   "manual": ManualEntryResponse,
 *   "similarity_score": number
 * }
 */
export interface ManualSearchResult {
  manual: {
    id: string; // uuid
    keywords: string[];
    topic: string;
    background: string;
    guideline: string;
    business_type?: string | null;
    error_code?: string | null;
    source_consultation_id: string; // uuid
    version_id?: string | null; // uuid
    status: ManualDraftStatus;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
  };
  similarity_score: number; // 0.0 ~ 1.0
}

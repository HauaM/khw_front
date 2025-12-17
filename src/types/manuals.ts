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
    business_type_name?: string | null;
    error_code?: string | null;
    source_consultation_id: string; // uuid
    version_id?: string | null; // uuid
    status: ManualDraftStatus;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
  };
  similarity_score: number; // 0.0 ~ 1.0
}

/**
 * 메뉴얼 상세 조회 응답 타입
 * OpenAPI: ManualEntryResponse를 기반으로 함
 *
 * guideline이 문자열로 전달되므로, 프론트엔드에서는 필요시 배열로 변환합니다.
 */
export interface ManualDetail {
  id: string; // uuid
  topic: string;
  keywords: string[];
  background: string;
  guideline: string; // API: 줄바꿈으로 구분된 문자열
  status: ManualDraftStatus;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  business_type_name?: string | null;
  error_code?: string | null;
  source_consultation_id: string; // uuid
  version_id?: string | null; // uuid
}

/**
 * 메뉴얼 상세 조회 가이드라인 항목 (프론트엔드용)
 */
export interface ManualGuideline {
  title: string;
  description: string;
}

/**
 * 메뉴얼 수정 폼 오류 객체 타입
 */
export interface ManualEditErrors {
  topic?: string;
  keywords?: string;
  background?: string;
  guidelines?: string;
  [key: string]: string | undefined; // guideline_title_0, guideline_desc_0 등
}

/**
 * 메뉴얼 업데이트 요청 페이로드 (기존 메뉴얼 수정용)
 * guideline을 JSON 배열 문자열로 전송하거나 개별 필드로 전송
 */
export interface ManualUpdatePayload {
  topic: string;
  keywords: string[];
  background: string;
  guidelines: ManualGuideline[];
  status: ManualDraftStatus;
}

/**
 * 메뉴얼 버전 정보
 * 버전 선택 드롭다운에서 사용
 */
export interface ManualVersionInfo {
  value: string; // "v2.1"
  label: string; // "v2.1 (현재 버전)"
  date: string; // "2024-01-15"
}

/**
 * 메뉴얼 버전 상세 정보
 * 버전 비교에서 좌/우 컬럼에 표시되는 데이터
 *
 * guideline이 배열로 제공됨을 주의하세요.
 * API 응답과는 다르게 이미 가이드라인 항목으로 파싱된 형태입니다.
 */
export interface ManualVersionDetail {
  manual_id: string; // UUID
  version: string; // "v2.1"
  topic: string;
  keywords: string[];
  background: string;
  guidelines: ManualGuideline[]; // 제목-설명 쌍의 배열
  status: ManualDraftStatus;
  updated_at: string; // ISO datetime
}

/**
 * 변경 상태 플래그
 * 키워드와 가이드라인의 추가/삭제/수정 여부를 나타냅니다.
 */
export type ChangeFlag = '' | 'ADDED' | 'REMOVED' | 'MODIFIED';

/**
 * 승인된 메뉴얼 카드 항목
 * "승인된 메뉴얼" 화면에서 표시되는 카드 데이터 모델
 */
export interface ApprovedManualCardItem {
  id: string; // manual_id
  keywords: string[];
  topic: string;
  background: string;
  guideline: string; // "\n" 기준으로 단계 분리
  business_type: string;
  error_code: string;
  source_consultation_id: string;
  version_id: string;
  status: ManualDraftStatus;
  business_type_name?: string;
  created_at: string;
  updated_at: string;
}

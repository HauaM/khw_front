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

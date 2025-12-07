import { api } from './axiosClient';
import {
  ManualDraft,
  ManualDraftUpdateRequest,
  ManualDraftResponse,
  ManualSearchParams,
  ManualSearchResult,
  ManualDetail,
  ManualVersionInfo,
  ManualVersionDetail,
  ManualGuideline,
} from '@/types/manuals';

// Re-export types for convenience
export type { ManualDraft, ManualDraftResponse };

// OpenAPI: ManualDraftCreateFromConsultationRequest
export interface ManualDraftCreatePayload {
  consultation_id: string;
  enforce_hallucination_check?: boolean; // default true
}

/**
 * OpenAPI: ManualReviewTaskResponse (검토 태스크 생성 응답)
 */
export interface ManualReviewTaskResponse {
  id: string;
  created_at: string;
  updated_at: string;
  old_entry_id: string | null;
  new_entry_id: string;
  similarity: number;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'REJECTED';
  reviewer_id: string | null;
  review_notes: string | null;
}

/**
 * Guideline 배열을 줄바꿈으로 구분된 문자열로 변환
 * @param guidelines - 가이드라인 배열
 * @returns 줄바꿈으로 구분된 문자열
 */
export const guidelinesToString = (guidelines: string[]): string => {
  return guidelines.join('\n');
};

/**
 * 줄바꿈으로 구분된 문자열을 가이드라인 배열로 변환
 * @param guidelineStr - 줄바꿈으로 구분된 문자열
 * @returns 가이드라인 배열
 */
export const stringToGuidelines = (guidelineStr: string): string[] => {
  return guidelineStr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

/**
 * API 응답의 ManualDraftResponse를 프론트엔드의 ManualDraft로 변환
 * @param apiResponse - API 응답
 * @returns ManualDraft 객체
 */
export const convertApiResponseToManualDraft = (apiResponse: ManualDraftResponse): ManualDraft => {
  return {
    id: apiResponse.id,
    status: apiResponse.status,
    keywords: apiResponse.keywords,
    topic: apiResponse.topic,
    background: apiResponse.background,
    guideline: stringToGuidelines(apiResponse.guideline),
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
    source_consultation_id: apiResponse.source_consultation_id,
  };
};

/**
 * 상담으로부터 메뉴얼 초안 생성
 * OpenAPI: POST /api/v1/manuals/draft
 * @param payload - ManualDraftCreateFromConsultationRequest
 */
export const createManualDraft = (payload: ManualDraftCreatePayload) =>
  api.post<ManualDraftResponse>('/api/v1/manuals/draft', payload, {
    // 메뉴얼 생성은 시간이 오래 걸릴 수 있어 요청 타임아웃을 넉넉히 120초로 설정
    timeout: 120_000,
  });

/**
 * 메뉴얼 초안 조회
 * OpenAPI: GET /api/v1/manuals/drafts/{draft_id} (백엔드에서 구현 필요)
 *
 * @param draftId - 초안 ID (예: 'DRAFT-2024-001' 또는 UUID)
 *
 * TODO: 백엔드에서 다음 엔드포인트를 구현해야 합니다:
 * - GET /api/v1/manuals/drafts/{draft_id}
 * - 응답: ManualDraftResponse
 */
export const getManualDraft = (draftId: string) =>
  api.get<ManualDraftResponse>(`/api/v1/manuals/drafts/${draftId}`);

/**
 * 메뉴얼 초안 업데이트
 * OpenAPI: PUT /api/v1/manuals/drafts/{draft_id} (백엔드에서 구현 필요)
 *
 * @param draftId - 초안 ID
 * @param payload - 업데이트할 데이터 (guideline은 줄바꿈으로 구분된 문자열)
 *
 * TODO: 백엔드에서 다음 엔드포인트를 구현해야 합니다:
 * - PUT /api/v1/manuals/drafts/{draft_id}
 * - Request body: { topic, keywords, background, guideline }
 * - 응답: ManualDraftResponse
 */
export const updateManualDraft = (draftId: string, payload: ManualDraftUpdateRequest) =>
  api.put<ManualDraftResponse>(`/api/v1/manuals/drafts/${draftId}`, payload);

/**
 * 메뉴얼 초안 검토 요청
 * OpenAPI: POST /api/v1/manuals/{manual_id}/review
 *
 * @param manualId - 메뉴얼 ID (초안 ID)
 * @returns ManualReviewTaskResponse
 */
export const requestManualReview = (manualId: string) =>
  api.post<ManualReviewTaskResponse>(`/api/v1/manuals/${manualId}/review`, {});

/**
 * 메뉴얼 벡터 검색
 * OpenAPI: GET /api/v1/manuals/search
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과 배열
 *
 * 요청 예시:
 * GET /api/v1/manuals/search?query=인터넷뱅킹&business_type=인터넷뱅킹&top_k=10&similarity_threshold=0.7
 *
 * 응답 형식:
 * [
 *   {
 *     "manual": {
 *       "id": "uuid",
 *       "keywords": ["string"],
 *       "topic": "string",
 *       ...
 *     },
 *     "similarity_score": 0.95
 *   }
 * ]
 */
export const searchManuals = (params: ManualSearchParams) => {
  // Query string으로 변환 (null/undefined 값은 제외)
  const queryParams = new URLSearchParams();

  // 필수 파라미터
  if (params.query) {
    queryParams.append('query', params.query);
  }

  // 선택 파라미터
  if (params.business_type) {
    queryParams.append('business_type', params.business_type);
  }
  if (params.error_code) {
    queryParams.append('error_code', params.error_code);
  }
  if (params.status) {
    queryParams.append('status', params.status);
  }
  if (params.top_k) {
    queryParams.append('top_k', params.top_k.toString());
  }
  if (params.similarity_threshold !== undefined) {
    queryParams.append('similarity_threshold', params.similarity_threshold.toString());
  }

  const queryString = queryParams.toString();
  return api.get<ManualSearchResult[]>(`/api/v1/manuals/search${queryString ? `?${queryString}` : ''}`);
};

/**
 * 메뉴얼 상세 조회
 * OpenAPI: GET /api/v1/manuals (목록 조회 후 필터링) 또는 GET /api/v1/manuals/{manual_id}
 *
 * @param manualId - 메뉴얼 ID (UUID)
 * @returns ManualDetail 객체 (ManualEntryResponse와 동일한 구조)
 *
 * 참고: OpenAPI에 /api/v1/manuals/{manual_id} 엔드포인트가 명시적으로 없는 경우,
 * 백엔드에서 다음과 같이 구현해야 합니다:
 * - GET /api/v1/manuals/{manual_id}
 * - 응답: ManualEntryResponse (ManualDetail 타입과 동일)
 */
export const getManualDetail = (manualId: string) =>
  api.get<ManualDetail>(`/api/v1/manuals/${manualId}`);

/**
 * 메뉴얼 업데이트
 * OpenAPI: PUT /api/v1/manuals/{manual_id}
 *
 * ⚠️ 이 API는 현재 OpenAPI 스펙에 정의되어 있지 않습니다!
 * 백엔드에서 아래 스펙으로 구현해주세요.
 *
 * @param manualId - 메뉴얼 ID (UUID 형식)
 * @param payload - 업데이트 요청 페이로드
 * @returns 업데이트된 ManualDetail 객체
 *
 * ================== 백엔드 구현 스펙 ==================
 *
 * 엔드포인트: PUT /api/v1/manuals/{manual_id}
 *
 * 경로 파라미터:
 *   - manual_id: string (UUID) - 메뉴얼 ID
 *
 * 요청 바디 (application/json):
 * {
 *   "topic": string (required) - 메뉴얼 주제 (최소 5자, 최대 200자)
 *   "keywords": string[] (required) - 키워드 배열 (최소 1개, 최대 3개)
 *   "background": string (required) - 배경 정보 (최소 10자)
 *   "guideline": string (required) - 조치사항 (줄바꿈\\n으로 구분된 문자열)
 *                                     형식: "제목1\\n설명1\\n제목2\\n설명2\\n..."
 *   "status": string (required) - 메뉴얼 상태 (enum: "DRAFT" | "APPROVED" | "DEPRECATED")
 * }
 *
 * 응답 (200 OK):
 * {
 *   "id": string (UUID)
 *   "created_at": string (ISO datetime)
 *   "updated_at": string (ISO datetime)
 *   "topic": string
 *   "keywords": string[]
 *   "background": string
 *   "guideline": string (줄바꿈으로 구분된 문자열)
 *   "status": string (enum)
 *   "source_consultation_id": string (UUID)
 *   "version_id": string | null (UUID)
 *   "business_type": string | null
 *   "error_code": string | null
 * }
 *
 * 에러 응답:
 *   - 400: Validation Error (필수 필드 누락 또는 형식 오류)
 *   - 404: Manual not found
 *   - 500: Internal server error
 *
 * 참고 사항:
 * 1. guideline 필드는 줄바꿈(\\n)으로 구분된 문자열 형식입니다.
 *    - 제목과 설명이 쌍(2개)으로 구성됩니다.
 *    - 예: "계정 상태 확인\\n고객의 아이디를 확인...\\n브라우저 점검\\n고객이 사용 중인..."
 * 2. 기존 메뉴얼의 version을 새로운 버전으로 생성할지 여부는
 *    별도 파라미터로 처리하거나 자동으로 버전 관리해주세요.
 * 3. 수정 권한 검사 (현재 사용자가 해당 메뉴얼을 수정할 수 있는지)
 *    는 필요시 구현해주세요.
 *
 * ===================================================
 */
export const updateManual = (manualId: string, payload: any) =>
  api.put<ManualDetail>(`/api/v1/manuals/${manualId}`, payload);

/**
 * 메뉴얼 버전 목록 조회
 * OpenAPI: GET /api/v1/manuals/{manual_group_id}/versions
 *
 * 응답 예시:
 * [
 *   {
 *     "value": "v2.1",
 *     "label": "v2.1 (현재 버전)",
 *     "date": "2024-01-15"
 *   },
 *   {
 *     "value": "v2.0",
 *     "label": "v2.0",
 *     "date": "2024-01-01"
 *   }
 * ]
 *
 * 백엔드 구현 필수 사항:
 * 1. OpenAPI의 ManualVersionResponse를 ManualVersionInfo로 변환
 *    - version → value
 *    - approved_at → date (YYYY-MM-DD 형식)
 *    - label 생성 (버전 + 현재 버전 여부)
 * 2. 버전을 최신순으로 정렬하여 반환
 *
 * @param manualId - 메뉴얼 ID (manual_group_id와 동일)
 * @returns 버전 정보 배열 (최신부터 정렬)
 */
export const getManualVersions = (manualId: string) =>
  api.get<ManualVersionInfo[]>(`/api/v1/manuals/${manualId}/versions`);

/**
 * 메뉴얼 특정 버전 상세 조회
 * OpenAPI: GET /api/v1/manuals/{manual_id} (현재 최신 버전만 가능)
 *
 * 백엔드 구현 가이드:
 * 다음 두 가지 옵션 중 선택하여 구현하세요:
 *
 * [옵션 1] 새로운 엔드포인트 추가 (권장)
 * - GET /api/v1/manuals/{manual_id}/versions/{version}
 * - 요청: manual_id (경로), version (경로)
 * - 응답: ManualVersionDetail
 *   {
 *     "manual_id": "uuid",
 *     "version": "v2.1",
 *     "topic": "string",
 *     "keywords": ["string"],
 *     "background": "string",
 *     "guidelines": [
 *       { "title": "string", "description": "string" }
 *     ],
 *     "status": "APPROVED|DEPRECATED",
 *     "updated_at": "ISO 8601 datetime"
 *   }
 *
 * [옵션 2] Diff API 활용
 * - GET /api/v1/manuals/{manual_group_id}/diff?base_version=v2.0&compare_version=v2.1
 * - 응답: ManualVersionDiffResponse
 * - 프론트에서 diff 결과를 파싱하여 사용
 *
 * [옵션 3] 버전 파라미터로 조회 (임시 방안)
 * - GET /api/v1/manuals/{manual_id}?version=v2.0
 * - 응답: ManualEntryResponse (guideline은 문자열, 프론트에서 파싱 필요)
 *
 * 현재 프론트엔드는 [옵션 1]을 가정하고 구현되었습니다.
 *
 * @param manualId - 메뉴얼 ID (UUID)
 * @param version - 버전 문자열 (예: "v2.1")
 * @returns 버전 상세 정보 (guideline은 배열로 변환됨)
 */
export const getManualVersionDetail = (manualId: string, version: string) =>
  api.get<ManualVersionDetail>(`/api/v1/manuals/${manualId}/versions/${version}`);

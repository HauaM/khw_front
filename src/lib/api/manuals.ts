import { ApiErrorResponse, ApiResponse, isApiSuccess } from '@/types/api';
import { api } from './axiosClient';
import {
  ManualDraft,
  ManualDraftUpdateRequest,
  ManualDraftResponse,
  ManualSearchParams,
  ManualSearchResultApi,
  ManualSearchResult,
  ManualDetail,
  ManualVersionInfo,
  ManualVersionDetail,
  ManualDraftStatus,
  ManualCardItem,
  ApprovedManualCardItem,
} from '@/types/manuals';
import { BackendManualReviewTask } from '@/types/reviews';
import { ApiResponseError } from '@/lib/api/responseHandler';

// Re-export types for convenience
export type { ManualDraft, ManualDraftResponse, ManualDetail, ManualDraftStatus };

// OpenAPI: ManualDraftCreateFromConsultationRequest
export interface ManualDraftCreatePayload {
  consultation_id: string;
  enforce_hallucination_check?: boolean; // default true
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
export const convertApiResponseToManualDraft = (
  apiResponse: ManualDraftResponse | ManualDetail
): ManualDraft => {
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
 * @returns ApiResponse<ManualDraftResponse>
 */
export const createManualDraft = (payload: ManualDraftCreatePayload) =>
  api.post<ApiResponse<ManualDraftResponse>>('/api/v1/manuals/draft', payload, {
    // 메뉴얼 생성은 시간이 오래 걸릴 수 있어 요청 타임아웃을 넉넉히 120초로 설정
    timeout: 120_000,
  });

/**
 * 메뉴얼 초안 업데이트
 * OpenAPI: PUT /api/v1/manuals/{manual_id}
 *
 * 백엔드 확인 완료:
 * - Draft 생성 시 반환되는 id = manual_id (동일)
 * - Draft와 Manual은 같은 ManualEntry 객체 (상태만 다름)
 * - Draft 수정은 PUT /api/v1/manuals/{manual_id}로 수행
 *
 * @param draftId - 초안 ID (= manual_id)
 * @param payload - 업데이트할 데이터 (guideline은 줄바꿈으로 구분된 문자열)
 * @returns ManualDraftResponse
 */
/**
 * 메뉴얼 초안 업데이트
 * @returns ApiResponse<ManualDraftResponse>
 */
export const updateManualDraft = (draftId: string, payload: ManualDraftUpdateRequest) =>
  api.put<ApiResponse<ManualDraftResponse>>(`/api/v1/manuals/${draftId}`, payload);

/**
 * 메뉴얼 검토 요청
 * OpenAPI: PUT /api/v1/manual-review/tasks/{task_id}
 * FR-6: 검토 요청을 위해 상태를 갱신합니다.
 *
 * @param taskId - 메뉴얼 ID (UUID)
 * @returns ApiResponse<ManualDetail>
 */
export const requestManualReview = (taskId: string) =>
  api.put<ApiResponse<ManualDetail>>(`/api/v1/manual-review/tasks/${taskId}`, { });

/**
 * 메뉴얼에 대한 검토 Task 목록 조회
 * OpenAPI: GET /api/v1/manuals/{manual_id}/review-tasks
 *
 * @param manualId - 메뉴얼 ID (UUID)
 * @returns ApiResponse<BackendManualReviewTask[]>
 */
export const fetchManualReviewTasksByManualId = (manualId: string) =>
  api.get<ApiResponse<BackendManualReviewTask[]>>(`/api/v1/manuals/${manualId}/review-tasks`);


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
 * 응답 형식 (ApiResponse 래핑):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "manual": { ... },
 *       "similarity_score": 0.95
 *     }
 *   ],
 *   "error": null,
 *   "meta": { ... },
 *   "feedback": []
 * }
 */
export const searchManuals = async (params: ManualSearchParams): Promise<ManualSearchResult[]> => {
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
  const response = await api.get<ApiResponse<ManualSearchResultApi[]>>(
    `/api/v1/manuals/search${queryString ? `?${queryString}` : ''}`
  );
  if (!isApiSuccess(response)) {
    throw new ApiResponseError(response as ApiErrorResponse);
  }

  const rawResults = response.data || [];

  return rawResults.map((item) => ({
    similarity_score: item.similarity_score,
    manual: {
      ...item.manual,
      business_type_name: item.manual.business_type_name ?? item.manual.business_type ?? null,
      error_code: item.manual.error_code ?? null,
      version_id: item.manual.version_id ?? null,
    },
  }));
};

/**
 * 메뉴얼 상세 조회
 * OpenAPI: GET /api/v1/manuals (목록 조회 후 필터링) 또는 GET /api/v1/manuals/{manual_id}
 *
 * @param manualId - 메뉴얼 ID (UUID)
 * @returns ApiResponse<ManualDetail>
 *
 * 참고: OpenAPI에 /api/v1/manuals/{manual_id} 엔드포인트가 명시적으로 없는 경우,
 * 백엔드에서 다음과 같이 구현해야 합니다:
 * - GET /api/v1/manuals/{manual_id}
 * - 응답: ManualEntryResponse (ManualDetail 타입과 동일)
 */
export const getManualDetail = (manualId: string) =>
  api.get<ApiResponse<ManualDetail>>(`/api/v1/manuals/${manualId}`);

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
/**
 * 메뉴얼 업데이트
 * @returns ApiResponse<ManualDetail>
 */
export const updateManual = (manualId: string, payload: any) =>
  api.put<ApiResponse<ManualDetail>>(`/api/v1/manuals/${manualId}`, payload);

/**
 * OpenAPI ManualVersionResponse를 프론트엔드 ManualVersionInfo로 변환
 * @param apiResponse - API 응답 (version, label, date)
 * @returns ManualVersionInfo (value, label, date)
 */
const convertManualVersionResponse = (apiResponse: any): ManualVersionInfo => {
  return {
    value: apiResponse.version, // OpenAPI: version → Frontend: value
    label: apiResponse.label,
    date: apiResponse.date,
  };
};

/**
 * 메뉴얼 버전 목록 조회
 * OpenAPI: GET /api/v1/manuals/{manual_group_id}/versions
 *
 * API 응답 형식 (OpenAPI):
 * [
 *   {
 *     "version": "v2.1",
 *     "label": "v2.1 (현재 버전)",
 *     "date": "2024-01-15"
 *   }
 * ]
 *
 * 프론트엔드 변환 후:
 * [
 *   {
 *     "value": "v2.1",
 *     "label": "v2.1 (현재 버전)",
 *     "date": "2024-01-15"
 *   }
 * ]
 *
 * @param manualId - 메뉴얼 ID (manual_group_id와 동일)
 * @returns 버전 정보 배열 (version → value 변환됨, 최신부터 정렬)
 */
/**
 * 메뉴얼 버전 목록 조회
 * @returns 버전 정보 배열 (version → value 변환됨, 최신부터 정렬)
 */
export const getManualVersions = async (manualId: string): Promise<ManualVersionInfo[]> => {
  const response = await api.get<ApiResponse<any[]>>(`/api/v1/manuals/${manualId}/versions`);
  // API 공통 규격의 data 필드에서 배열 추출
  const versions = response.data || [];
  // OpenAPI 응답의 version 필드를 프론트엔드의 value 필드로 변환
  return versions.map(convertManualVersionResponse);
};

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
/**
 * 메뉴얼 특정 버전 상세 조회
 * @returns ApiResponse<ManualVersionDetail>
 */
export const getManualVersionDetail = (manualId: string, version: string) =>
  api.get<ApiResponse<ManualVersionDetail>>(`/api/v1/manuals/${manualId}/versions/${version}`);

/**
 * 메뉴얼 초안 목록 조회 및 필터링
 * FR-16: GET /api/v1/manuals?status_filter=DRAFT&limit=...
 *
 * @param filters - 필터 옵션
 * @returns 메뉴얼 목록 (상태별, business_type_name, error_code 포함)
 */
export interface ManualDraftListFilters {
  status_filter?: string; // default: "DRAFT"
  limit?: number; // default: 100
  business_type?: string | null;
  error_code?: string | null;
  topic?: string | null;
  created_at_from?: string | null; // ISO date
  created_at_to?: string | null; // ISO date
}

export interface ManualDraftListResponse {
  id: string;
  status: ManualDraftStatus;
  keywords: string[];
  topic: string;
  background: string;
  guideline: string;
  created_at: string;
  updated_at: string;
  source_consultation_id: string;
  business_type?: string | null;
  error_code?: string | null;
  business_type_name?: string | null;
  version_id?: string | null;
}

/**
 * 메뉴얼 초안 목록 조회
 * GET /api/v1/manuals?status_filter=DRAFT&limit=...
 *
 * @param filters - 필터 조건 (status_filter, limit)
 * @returns 메뉴얼 초안 목록
 */
/**
 * 메뉴얼 초안 목록 조회
 * @returns ApiResponse<ManualDraftListResponse[]>
 */
export const getManualDraftList = (filters: ManualDraftListFilters) => {
  const queryParams = new URLSearchParams();

  // 기본값: status_filter=DRAFT
  queryParams.append('status_filter', filters.status_filter || 'DRAFT');

  // limit
  if (filters.limit) {
    queryParams.append('limit', filters.limit.toString());
  }

  const queryString = queryParams.toString();
  return api.get<ApiResponse<ManualDraftListResponse[]>>(
    `/api/v1/manuals${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * 메뉴얼 초안 삭제
 * DELETE /api/v1/manuals/{manual_id}
 *
 * @param manualId - 메뉴얼 ID (UUID)
 * @returns void (204 No Content)
 */
export const deleteManualDraft = (manualId: string) =>
  api.delete(`/api/v1/manuals/${manualId}`);

/**
 * 승인된 메뉴얼 그룹 조회
 * GET /api/v1/manuals/{manual_id}/approved-group
 *
 * 지정된 메뉴얼과 같은 business_type + error_code를 가진 APPROVED 메뉴얼 목록 조회
 *
 * @param manualId - 메뉴얼 ID (UUID) - 이 메뉴얼과 같은 그룹의 승인된 메뉴얼들을 조회
 * @returns 승인된 메뉴얼 목록
 */
export const getApprovedManualGroup = (manualId: string) =>
  api.get<ApiResponse<ApprovedManualCardItem[]>>(`/api/v1/manuals/${manualId}/approved-group`);

export const getApprovedManuals = (manualId: string) =>
  api.get<ApiResponse<ManualCardItem[]>>(`/api/v1/manuals/${manualId}/approved-group`);

export type { ApprovedManualCardItem } from '@/types/manuals';

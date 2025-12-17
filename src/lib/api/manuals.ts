import { ApiResponse } from '@/types/api';
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
  ManualDraftStatus,
  ManualCardItem,
  ApprovedManualCardItem,
} from '@/types/manuals';
import { BackendManualReviewTask } from '@/types/reviews';

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
  return api.get<ApiResponse<ManualSearchResult[]>>(`/api/v1/manuals/search${queryString ? `?${queryString}` : ''}`);
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

interface GetApprovedManualsParams {
  business_type?: string | null;
  error_code?: string | null;
}

const MOCK_APPROVED_MANUALS: ManualCardItem[] = [
  {
    id: '3c4a6bbf-6d3a-4f6c-92cb-7e1e7ab2f0f9',
    keywords: ['로그인', '인증'],
    topic: '로그인 실패 시 대응',
    background: '인증 서버 장애로 N건 이상 발생',
    guideline: '1. 사용자 인증 정보 확인\n2. 서버 상태 점검\n3. 장애 접수 및 처리\n4. 고객 안내',
    business_type: 'INTERNET_BANKING',
    error_code: 'E001',
    source_consultation_id: 'd9af8c29-3b07-4b71-9ef1-5b2c7a7890f4',
    version_id: '23b7a2d1-1d38-4f28-b5f3-2d9c5d7d4fce',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-10T08:00:00Z',
    updated_at: '2025-12-11T09:12:00Z',
  },
  {
    id: '5eecac0d-6cb3-4b5a-9e2b-6a5d32fd3447',
    keywords: ['인증', '보안'],
    topic: '로그인 오류 대응',
    background: '더 많은 사용자 문의',
    guideline: '1. 계정 상태 확인\n2. 보안 인증 재설정\n3. 임시 비밀번호 발급',
    business_type: 'INTERNET_BANKING',
    error_code: 'E001',
    source_consultation_id: 'f1e0828b-96c2-4955-9ee2-13c1d1f5c0e5',
    version_id: '5f1d8fde-13c3-4b10-95a4-9e432d41f4fc',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-09T07:32:00Z',
    updated_at: '2025-12-09T08:00:00Z',
  },
  {
    id: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
    keywords: ['계좌', '이체'],
    topic: '계좌 이체 실패 처리',
    background: '시스템 점검 시간 중 이체 시도 증가',
    guideline: '1. 점검 시간 확인\n2. 고객 안내\n3. 이체 재시도 안내\n4. 필요시 수동 처리',
    business_type: 'INTERNET_BANKING',
    error_code: 'E002',
    source_consultation_id: 'a9b8c7d6-e5f4-3210-9876-fedcba098765',
    version_id: 'v1v2v3v4-w5w6-x7x8-y9y0-z1z2z3z4z5z6',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-08T10:15:00Z',
    updated_at: '2025-12-08T11:30:00Z',
  },
  {
    id: 'q2w3e4r5-t6y7-u8i9-o0p1-a2s3d4f5g6h7',
    keywords: ['비밀번호', '찾기'],
    topic: '비밀번호 찾기 오류',
    background: 'SMS 인증 지연으로 인한 문의 증가',
    guideline: '1. SMS 발송 이력 확인\n2. 통신사 장애 확인\n3. 대체 인증 수단 안내\n4. 영업점 방문 안내',
    business_type: 'INTERNET_BANKING',
    error_code: 'E003',
    source_consultation_id: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4',
    version_id: 'k4l5m6n7-o8p9-q0r1-s2t3-u4v5w6x7y8z9',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-07T14:20:00Z',
    updated_at: '2025-12-07T15:45:00Z',
  },
  {
    id: 'j8k9l0m1-n2o3-p4q5-r6s7-t8u9v0w1x2y3',
    keywords: ['공인인증서', '갱신'],
    topic: '공인인증서 갱신 오류',
    background: '만료 임박 인증서 갱신 시도 증가',
    guideline: '1. 인증서 만료일 확인\n2. 브라우저 호환성 점검\n3. 보안프로그램 설치 확인\n4. 재발급 안내',
    business_type: 'INTERNET_BANKING',
    error_code: 'E004',
    source_consultation_id: 'h7g6f5e4-d3c2-b1a0-9876-543210fedcba',
    version_id: 'm1n2o3p4-q5r6-s7t8-u9v0-w1x2y3z4a5b6',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-06T09:30:00Z',
    updated_at: '2025-12-06T10:00:00Z',
  },
  {
    id: 'c7d8e9f0-g1h2-i3j4-k5l6-m7n8o9p0q1r2',
    keywords: ['잔액', '조회'],
    topic: '잔액 조회 불가 처리',
    background: 'DB 동기화 지연으로 인한 일시적 오류',
    guideline: '1. 시스템 상태 확인\n2. 캐시 삭제 안내\n3. 재로그인 요청\n4. 지속 시 고객센터 연결',
    business_type: 'INTERNET_BANKING',
    error_code: 'E005',
    source_consultation_id: 'r2q1p0o9-n8m7-l6k5-j4i3-h2g1f0e9d8c7',
    version_id: 's3t4u5v6-w7x8-y9z0-a1b2-c3d4e5f6g7h8',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-05T16:45:00Z',
    updated_at: '2025-12-05T17:20:00Z',
  },
  {
    id: 'i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4',
    keywords: ['모바일', '앱'],
    topic: '모바일 앱 로그인 오류',
    background: '앱 업데이트 후 일부 기기에서 발생',
    guideline: '1. 앱 버전 확인\n2. 재설치 안내\n3. OS 버전 확인\n4. 웹 뱅킹 대체 이용 안내',
    business_type: 'MOBILE_BANKING',
    error_code: 'E006',
    source_consultation_id: 'x4w3v2u1-t0s9-r8q7-p6o5-n4m3l2k1j0i9',
    version_id: 'y5z6a7b8-c9d0-e1f2-g3h4-i5j6k7l8m9n0',
    status: 'APPROVED',
    business_type_name: '모바일뱅킹',
    created_at: '2025-12-04T11:00:00Z',
    updated_at: '2025-12-04T12:15:00Z',
  },
  {
    id: 'o0p1q2r3-s4t5-u6v7-w8x9-y0z1a2b3c4d5',
    keywords: ['송금', '한도'],
    topic: '송금 한도 초과 처리',
    background: '일일 한도 초과로 인한 문의',
    guideline: '1. 현재 한도 확인\n2. 한도 상향 절차 안내\n3. 분할 송금 제안\n4. 영업점 방문 안내',
    business_type: 'INTERNET_BANKING',
    error_code: 'E007',
    source_consultation_id: 'd5c4b3a2-z1y0-x9w8-v7u6-t5s4r3q2p1o0',
    version_id: 'e6f7g8h9-i0j1-k2l3-m4n5-o6p7q8r9s0t1',
    status: 'APPROVED',
    business_type_name: '인터넷뱅킹',
    created_at: '2025-12-03T13:25:00Z',
    updated_at: '2025-12-03T14:50:00Z',
  },
];

export const getApprovedManuals = async ({
  business_type,
  error_code,
}: GetApprovedManualsParams): Promise<ManualCardItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_APPROVED_MANUALS.filter((manual) => {
    if (business_type && manual.business_type !== business_type) {
      return false;
    }
    if (error_code && manual.error_code !== error_code) {
      return false;
    }
    return true;
  });
};

export type { ApprovedManualCardItem } from '@/types/manuals';

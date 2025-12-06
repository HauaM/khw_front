import { api } from './axiosClient';
import {
  ManualDraft,
  ManualDraftUpdateRequest,
  ManualDraftResponse,
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

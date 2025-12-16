import { useState } from 'react';
import { requestManualReview, ManualReviewTaskResponse } from '@/lib/api/manuals';

/**
 * 검토 태스크 응답 타입
 * OpenAPI: ManualReviewTaskResponse
 */
export interface ReviewTaskResponse {
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

export interface UseRequestManualReviewResult {
  mutate: (manualId: string) => Promise<ManualReviewTaskResponse | null>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: ManualReviewTaskResponse | null;
}

/**
 * 메뉴얼 초안 검토를 요청하는 훅
 * OpenAPI: POST /api/v1/manuals/draft/{manual_id}/conflict-check
 * FR-6: 신규 초안과 기존 메뉴얼 자동 비교
 *
 * 반환값:
 * - ManualReviewTaskResponse: 충돌이 있어서 검토 Task가 생성된 경우
 * - null: 충돌이 없어서 Task가 생성되지 않은 경우
 */
export const useRequestManualReview = (): UseRequestManualReviewResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ManualReviewTaskResponse | null>(null);

  const mutate = async (manualId: string): Promise<ManualReviewTaskResponse | null> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // OpenAPI: POST /api/v1/manuals/draft/{manual_id}/conflict-check
      const response = await requestManualReview(manualId);

      setData(response.data);
      return response.data;
    } catch (err) {
      setIsError(true);
      const error = err instanceof Error ? err : new Error('검토 요청에 실패했습니다.');
      setError(error);
      console.error('Error requesting manual review:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, isError, error, data };
};

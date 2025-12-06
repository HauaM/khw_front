import { useState } from 'react';
// TODO: API 연결 시 활성화
// import { requestManualReview, ManualReviewTaskResponse } from '@/lib/api/manuals';

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
  mutate: (manualId: string) => Promise<ReviewTaskResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: ReviewTaskResponse | null;
}

/**
 * 메뉴얼 초안 검토를 요청하는 훅
 * OpenAPI: POST /api/v1/manuals/{manual_id}/review
 */
export const useRequestManualReview = (): UseRequestManualReviewResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ReviewTaskResponse | null>(null);

  const mutate = async (manualId: string): Promise<ReviewTaskResponse> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // TODO: API 연결 - 아래 주석을 풀면 실제 API 호출
      // const response = await requestManualReview(manualId);

      // 현재는 mock 요청 (1.5초 지연)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: ReviewTaskResponse = {
        id: `REVIEW-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        old_entry_id: null,
        new_entry_id: manualId,
        similarity: 0,
        status: 'TODO',
        reviewer_id: null,
        review_notes: null,
      };

      setData(mockResult);
      return mockResult;
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

import { useState } from 'react';
import { requestManualReview } from '@/lib/api/manuals';
import { ManualDetail } from '@/types/manuals';

export interface UseRequestManualReviewResult {
  mutate: (manualId: string) => Promise<ManualDetail>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: ManualDetail | null;
}

/**
 * 메뉴얼 초안 검토를 요청하는 훅
 * OpenAPI: PUT /api/v1/manuals/{manual_id}
 * FR-6: 검토 요청 상태를 백엔드로 전달합니다.
*/
export const useRequestManualReview = (): UseRequestManualReviewResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ManualDetail | null>(null);

  const mutate = async (manualId: string): Promise<ManualDetail> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
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

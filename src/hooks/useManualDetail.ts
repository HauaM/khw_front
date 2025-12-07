import { useState, useEffect } from 'react';
import { ManualDetail } from '@/types/manuals';
import { getManualDetail } from '@/lib/api/manuals';

export interface UseManualDetailResult {
  data: ManualDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 메뉴얼 상세 조회 데이터를 가져오는 훅
 * @param manualId - 메뉴얼 ID (UUID)
 * @returns { data, isLoading, isError, error }
 *
 * OpenAPI: GET /api/v1/manuals 또는 GET /api/v1/manuals/{manual_id}
 * 실제 API 호출을 통해 메뉴얼 데이터를 조회합니다.
 */
export const useManualDetail = (manualId: string): UseManualDetailResult => {
  const [data, setData] = useState<ManualDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadManualData = async () => {
      // manualId가 없으면 로드하지 않음
      if (!manualId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        // API 호출: GET /api/v1/manuals/{manual_id}
        // api.get() already extracts .data from the response, so we get the object directly
        const manualData = await getManualDetail(manualId);
        setData(manualData);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('Failed to load manual'));
        console.error('Error loading manual:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadManualData();
  }, [manualId]);

  return { data, isLoading, isError, error };
};

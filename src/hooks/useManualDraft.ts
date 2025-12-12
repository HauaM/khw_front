import { useEffect, useState } from 'react';
import { ManualDraft } from '@/types/manuals';
import {
  convertApiResponseToManualDraft,
  getManualDetail,
} from '@/lib/api/manuals';

export interface UseManualDraftResult {
  data: ManualDraft | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 메뉴얼 초안 데이터를 조회하는 훅
 * draftId가 있으면 API에서 가져오고, 없으면 mock 데이터를 반환합니다.
 */
export const useManualDraft = (draftId: string): UseManualDraftResult => {
  const [data, setData] = useState<ManualDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDraft = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    if (!draftId) {
      const idError = new Error('초안 ID가 제공되지 않았습니다. URL을 확인해주세요.');
      setError(idError);
      setIsError(true);
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getManualDetail(draftId);
      setData(convertApiResponseToManualDraft(response));
    } catch (err) {
      setIsError(true);
      const error = err instanceof Error ? err : new Error('초안 조회에 실패했습니다.');
      setError(error);
      console.error('Error fetching manual draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, [draftId]);

  const refetch = async () => {
    await fetchDraft();
  };

  return { data, isLoading, isError, error, refetch };
};

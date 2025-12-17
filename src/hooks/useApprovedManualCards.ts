import { useCallback, useEffect, useState } from 'react';
import { getApprovedManuals } from '@/lib/api/manuals';
import type { ManualCardItem, BusinessType } from '@/types/manuals';

export interface UseApprovedManualCardsResult {
  data: ManualCardItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useApprovedManualCards = (
  businessType: BusinessType,
  errorCode: string
): UseApprovedManualCardsResult => {
  const [data, setData] = useState<ManualCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchApprovedManuals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const manuals = await getApprovedManuals({
        business_type: businessType,
        error_code: errorCode,
      });
      setData(manuals);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('승인된 메뉴얼을 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessType, errorCode]);

  useEffect(() => {
    fetchApprovedManuals();
  }, [fetchApprovedManuals]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchApprovedManuals,
  };
};

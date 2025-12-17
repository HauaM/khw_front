import { useState, useCallback } from 'react';
import { ManualSearchParams, ManualSearchResult } from '@/types/manuals';
import { searchManuals } from '@/lib/api/manuals';

export interface UseManualSearchResult {
  data: ManualSearchResult[];
  isLoading: boolean;
  isSearched: boolean;
  error: Error | null;
  search: (params: ManualSearchParams) => Promise<void>;
  reset: () => void;
}

/**
 * 메뉴얼 검색 훅
 * OpenAPI GET /api/v1/manuals/search를 호출하고 결과를 관리합니다.
 */
export const useManualSearch = (): UseManualSearchResult => {
  const [data, setData] = useState<ManualSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (params: ManualSearchParams) => {
    // 검색어는 필수
    if (!params.query || params.query.trim() === '') {
      throw new Error('검색어를 입력해주세요.');
    }

    setIsLoading(true);
    setError(null);
    setIsSearched(false);

    try {
      // 실제 API 호출
      const response = await searchManuals(params);

      console.log('Manual search response:', response);

      setData(response.data || []);
      setIsSearched(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '검색 중 오류가 발생했습니다. 다시 시도해주세요.';
      const error = new Error(errorMessage);
      setError(error);
      setData([]);
      setIsSearched(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setIsLoading(false);
    setIsSearched(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    isSearched,
    error,
    search,
    reset,
  };
};

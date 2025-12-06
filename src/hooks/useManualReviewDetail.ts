/**
 * 메뉴얼 검토 상세 정보 조회 훅
 * 기존 메뉴얼과 신규 초안을 비교하는 페이지에서 사용
 */

import { useEffect, useState } from 'react';
import {
  ManualReviewDetail,
  UseManualReviewDetailResult,
} from '@/types/reviews';
import { fetchManualReviewDetail } from '@/lib/api/manualReviewTasks';

/**
 * 메뉴얼 검토 상세 정보 조회 훅
 *
 * @param taskId 검토 Task ID
 * @returns { data, isLoading, isError, error }
 *
 * TODO: 추후 React Query로 교체
 * - useQuery를 사용하여 서버 상태 관리
 * - 캐싱, 자동 리페칭 등 지원
 */
export function useManualReviewDetail(
  taskId: string
): UseManualReviewDetailResult {
  const [data, setData] = useState<ManualReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const detail = await fetchManualReviewDetail(taskId);
        setData(detail);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch detail')
        );
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [taskId]);

  return { data, isLoading, isError, error };
}

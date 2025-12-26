/**
 * useManualReviewComparison 훅
 *
 * 메뉴얼 검토 상세 조회 훅 (API 공통 규격 적용)
 * React Query의 useApiQuery를 사용하여 자동 피드백/에러 처리 제공
 */

import { useApiQuery } from '@/hooks/useApiQuery';
import { fetchManualReviewComparison } from '@/lib/api/manualReviewTasks';
import type { ManualReviewComparison } from '@/types/reviews';

/**
 * 메뉴얼 검토 상세 조회 훅
 *
 * @param taskId - 검토 Task ID
 * @returns React Query 결과 (data, isLoading, error, refetch 등)
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useManualReviewComparison(taskId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorState />;
 * if (!data) return null;
 *
 * return <ManualReviewDetailView detail={data} />;
 * ```
 */
export function useManualReviewComparison(taskId: string) {
  return useApiQuery<ManualReviewComparison>(
    ['manualReviewComparison', taskId],
    () => fetchManualReviewComparison(taskId),
    {
      // 피드백 자동 표시 (AI 분석 결과 등)
      autoShowFeedback: true,

      // 에러 자동 표시
      autoShowError: true,

      // 성공 메시지 (선택적)
      successMessage: '검토 상세 정보를 불러왔습니다.',

      // 에러별 커스텀 메시지
      errorMessages: {
        'RESOURCE.NOT_FOUND': '해당 검토 작업을 찾을 수 없습니다.',
        'AUTH.FORBIDDEN': '검토 상세 정보 접근 권한이 없습니다.',
        'VALIDATION.ERROR': '잘못된 Task ID입니다.',
      },

      // React Query 옵션
      queryOptions: {
        enabled: !!taskId, // taskId가 있을 때만 쿼리 실행
        staleTime: 5 * 60 * 1000, // 5분
        cacheTime: 10 * 60 * 1000, // 10분
        refetchOnWindowFocus: false, // 포커스 시 재조회 비활성화
        retry: 1, // 실패 시 1번만 재시도
      },
    }
  );
}

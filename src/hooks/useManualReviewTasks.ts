/**
 * 메뉴얼 검토 Task 목록 조회 훅
 * 백엔드 API (/api/v1/manual-review/tasks)와 연동
 * useApiQuery 패턴을 사용하여 자동 에러/피드백 처리
 */

import { useApiQuery } from '@/hooks/useApiQuery';
import {
  ManualReviewTask,
  ManualReviewTaskFilters,
} from '@/types/reviews';
import { fetchManualReviewTasksApi, transformBackendTask } from '@/lib/api/manualReviewTasks';

interface UseManualReviewTasksOptions {
  filters?: ManualReviewTaskFilters;
}

/**
 * 메뉴얼 검토 Task 목록 조회 훅
 *
 * @param options 옵션 (필터 포함)
 * @returns { data, isLoading, isError, error } - React Query 반환값
 *
 * @example
 * const { data: tasks, isLoading, isError } = useManualReviewTasks({
 *   filters: { status: 'TODO' }
 * });
 */
export function useManualReviewTasks(options?: UseManualReviewTasksOptions) {
  const status = options?.filters?.status !== '전체' ? options?.filters?.status : undefined;

  return useApiQuery<ManualReviewTask[]>(
    ['manualReviewTasks', status],
    async () => {
      const response = await fetchManualReviewTasksApi({
        status,
        limit: 100,
      });

      // BackendManualReviewTask[]를 ManualReviewTask[]로 변환하여 ApiResponse 형식 유지
      if (response.success) {
        return {
          ...response,
          data: response.data.map(transformBackendTask),
        };
      } else {
        return response;
      }
    },
    {
      autoShowError: true,
      autoShowFeedback: false,
      errorMessages: {
        'NETWORK_ERROR': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        'SERVER_ERROR': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        'NOT_FOUND': '검토 작업을 찾을 수 없습니다.',
      },
    }
  );
}

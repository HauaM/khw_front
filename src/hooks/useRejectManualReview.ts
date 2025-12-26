/**
 * 메뉴얼 검토 반려 훅 (API 공통 규격 적용)
 * 검토 Task를 반려 처리하는 기능을 제공합니다.
 *
 * useApiMutation 패턴 적용:
 * - 자동 피드백/에러 처리
 * - React Query의 useMutation 기반
 * - retry 로직, optimistic updates 지원
 */

import { useApiMutation } from '@/hooks/useApiMutation';
import { rejectManualReviewTaskApi } from '@/lib/api/manualReviewTasks';
import { BackendManualReviewTask } from '@/types/reviews';

interface RejectManualReviewVariables {
  taskId: string;
  reviewNotes: string;
}

interface UseRejectManualReviewOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 메뉴얼 검토 반려 훅
 *
 * @param options 콜백 옵션 (onSuccess, onError)
 * @returns React Query mutation 결과
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useRejectManualReview({
 *   onSuccess: () => navigate('/reviews')
 * });
 *
 * mutate({ taskId, reviewNotes: '반려 사유...' });
 * ```
 */
export function useRejectManualReview(options?: UseRejectManualReviewOptions) {
  return useApiMutation<BackendManualReviewTask, RejectManualReviewVariables>(
    ({ taskId, reviewNotes }) => rejectManualReviewTaskApi(taskId, reviewNotes),
    {
      successMessage: '검토가 반려되었습니다.',
      autoShowError: true,
      autoShowFeedback: true,
      errorMessages: {
        'VALIDATION.ERROR': '반려 사유는 최소 10글자 이상이어야 합니다.',
        'RESOURCE.NOT_FOUND': '해당 검토 작업을 찾을 수 없습니다.',
        'AUTH.FORBIDDEN': '반려 권한이 없습니다.',
      },
      onApiSuccess: options?.onSuccess,
      onApiError: options?.onError,
    }
  );
}

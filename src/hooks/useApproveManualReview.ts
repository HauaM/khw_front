/**
 * 메뉴얼 검토 승인 훅 (API 공통 규격 적용)
 * 검토 Task를 승인 처리하는 기능을 제공합니다.
 *
 * useApiMutation 패턴 적용:
 * - 자동 피드백/에러 처리
 * - React Query의 useMutation 기반
 * - retry 로직, optimistic updates 지원
 */

import { useApiMutation } from '@/hooks/useApiMutation';
import { approveManualReviewTaskApi } from '@/lib/api/manualReviewTasks';
import { BackendManualReviewTask } from '@/types/reviews';

interface ApproveManualReviewVariables {
  taskId: string;
  employeeId: string;
  reviewNotes?: string;
}

interface UseApproveManualReviewOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 메뉴얼 검토 승인 훅
 *
 * @param options 콜백 옵션 (onSuccess, onError)
 * @returns React Query mutation 결과
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useApproveManualReview({
 *   onSuccess: () => navigate('/reviews')
 * });
 *
 * mutate({ taskId, employeeId, reviewNotes });
 * ```
 */
export function useApproveManualReview(options?: UseApproveManualReviewOptions) {
  return useApiMutation<BackendManualReviewTask, ApproveManualReviewVariables>(
    ({ taskId, employeeId, reviewNotes }) =>
      approveManualReviewTaskApi(taskId, employeeId, reviewNotes),
    {
      successMessage: '검토가 승인되었습니다.',
      autoShowError: true,
      autoShowFeedback: true,
      errorMessages: {
        'VALIDATION.ERROR': '입력값이 올바르지 않습니다.',
        'RESOURCE.NOT_FOUND': '해당 검토 작업을 찾을 수 없습니다.',
        'AUTH.FORBIDDEN': '승인 권한이 없습니다.',
      },
      onApiSuccess: options?.onSuccess,
      onApiError: options?.onError,
    }
  );
}

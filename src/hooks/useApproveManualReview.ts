/**
 * 메뉴얼 검토 승인 훅
 * 검토 Task를 승인 처리하는 기능을 제공합니다.
 */

import { useState } from 'react';
import { approveManualReviewTask } from '@/lib/api/manualReviewTasks';

interface UseApproveManualReviewOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseApproveManualReviewResult {
  isLoading: boolean;
  error: Error | null;
  mutate: (taskId: string, reviewerId: string, reviewNotes?: string) => Promise<void>;
}

/**
 * 메뉴얼 검토 승인 훅
 *
 * @param options 콜백 옵션 (onSuccess, onError)
 * @returns { isLoading, error, mutate }
 *
 * TODO: 추후 React Query useMutation으로 교체
 * - 자동 error handling
 * - retry 로직
 * - optimistic updates 지원
 */
export function useApproveManualReview(
  options?: UseApproveManualReviewOptions
): UseApproveManualReviewResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    taskId: string,
    reviewerId: string,
    reviewNotes?: string
  ) => {
    if (!reviewerId || reviewerId.trim() === '') {
      const error = new Error('Reviewer ID is required');
      setError(error);
      options?.onError?.(error);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await approveManualReviewTask(taskId, reviewerId, reviewNotes);

      options?.onSuccess?.();
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('Failed to approve manual review');
      setError(errorObj);
      options?.onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, mutate };
}

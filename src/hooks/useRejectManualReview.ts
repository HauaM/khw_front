/**
 * 메뉴얼 검토 반려 훅
 * 검토 Task를 반려 처리하는 기능을 제공합니다.
 */

import { useState } from 'react';
import { rejectManualReviewTask } from '@/lib/api/manualReviewTasks';

interface UseRejectManualReviewOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseRejectManualReviewResult {
  isLoading: boolean;
  error: Error | null;
  mutate: (taskId: string, reason: string, reviewerId?: string) => Promise<void>;
}

/**
 * 메뉴얼 검토 반려 훅
 *
 * @param options 콜백 옵션 (onSuccess, onError)
 * @returns { isLoading, error, mutate }
 *
 * TODO: 추후 React Query useMutation으로 교체
 * - 자동 error handling
 * - retry 로직
 * - optimistic updates 지원
 */
export function useRejectManualReview(
  options?: UseRejectManualReviewOptions
): UseRejectManualReviewResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (taskId: string, reason: string, reviewerId?: string) => {
    if (!reason || reason.trim().length < 10) {
      const error = new Error('반려 사유는 최소 10글자 이상이어야 합니다');
      setError(error);
      options?.onError?.(error);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await rejectManualReviewTask(taskId, reason, reviewerId);

      options?.onSuccess?.();
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('Failed to reject manual review');
      setError(errorObj);
      options?.onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, mutate };
}

/**
 * 메뉴얼 검토 Task 시작 훅
 * 검토 Task를 시작(IN_PROGRESS)하는 기능을 제공합니다.
 */

import { useState } from 'react';
import { startManualReviewTask } from '@/lib/api/manualReviewTasks';

interface UseStartManualReviewTaskOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseStartManualReviewTaskResult {
  isLoading: boolean;
  error: Error | null;
  mutate: (taskId: string) => Promise<void>;
}

/**
 * 메뉴얼 검토 Task 시작 훅
 * OpenAPI: PUT /api/v1/manual-review/tasks/{task_id}
 * FR-6: 검토 태스크 시작 (TODO → IN_PROGRESS)
 *
 * @param options 콜백 옵션 (onSuccess, onError)
 * @returns { isLoading, error, mutate }
 */
export function useStartManualReviewTask(
  options?: UseStartManualReviewTaskOptions
): UseStartManualReviewTaskResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (taskId: string) => {
    if (!taskId || taskId.trim() === '') {
      const error = new Error('Task ID is required');
      setError(error);
      options?.onError?.(error);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await startManualReviewTask(taskId);

      options?.onSuccess?.();
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('Failed to start manual review task');
      setError(errorObj);
      options?.onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, mutate };
}

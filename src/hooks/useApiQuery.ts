/**
 * useApiQuery 훅 (선택사항)
 *
 * API 공통 규격 응답을 처리하기 위한 간단한 래퍼
 * React Query의 useQuery를 감싸서 자동 피드백/에러 처리 제공
 *
 * @note 이 훅은 API 응답이 ApiResponse<T> 형식일 때 사용
 * @note 기존 useQuery를 사용해도 되지만, 이 훅을 사용하면 자동 처리 가능
 */

import { useQuery } from '@tanstack/react-query';
import { ApiResponse, isApiSuccess } from '@/types/api';
import { ApiResponseError, getUserFriendlyErrorMessage } from '@/lib/api/responseHandler';
import { useToast } from './useToast';
import { useFeedback } from './useFeedback';

interface ApiQueryOptions<T> {
  /** 피드백 메시지 자동 표시 여부 (기본값: true) */
  autoShowFeedback?: boolean;
  /** 에러 메시지 자동 표시 여부 (기본값: true) */
  autoShowError?: boolean;
  /** 성공 메시지 표시 */
  successMessage?: string;
  /** 에러 코드별 커스텀 메시지 */
  errorMessages?: Record<string, string>;
  /** React Query options */
  queryOptions?: any;
}

/**
 * API 공통 규격 처리 useQuery
 *
 * @example
 * const { data } = useApiQuery(
 *   ['manuals', id],
 *   () => api.get(`/api/v1/manuals/${id}`),
 *   { autoShowError: true }
 * );
 */
export function useApiQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<ApiResponse<T>>,
  options: ApiQueryOptions<T> = {}
) {
  const {
    autoShowFeedback = true,
    autoShowError = true,
    successMessage,
    errorMessages = {},
    queryOptions = {},
  } = options;

  const toast = useToast();
  const { showFeedbacks } = useFeedback();

  return useQuery({
    ...queryOptions,
    queryKey,
    queryFn: async () => {
      try {
        const response = await queryFn();

        if (!isApiSuccess(response)) {
          throw new ApiResponseError(response);
        }

        const data = response.data;

        // 피드백 자동 표시
        if (autoShowFeedback && response.feedback && response.feedback.length > 0) {
          setTimeout(() => {
            showFeedbacks(response.feedback, 200);
          }, 100);
        }

        // 성공 메시지 표시
        if (successMessage) {
          setTimeout(() => {
            toast.success(successMessage);
          }, 200);
        }

        return data;
      } catch (error) {
        if (autoShowError && error instanceof ApiResponseError) {
          const customMessage = errorMessages[error.code];
          const errorMessage = customMessage || getUserFriendlyErrorMessage(error);
          setTimeout(() => {
            toast.error(errorMessage);
          }, 100);

          if (error.feedbacks && error.feedbacks.length > 0) {
            setTimeout(() => {
              showFeedbacks(error.feedbacks, 200);
            }, 200);
          }
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiResponseError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

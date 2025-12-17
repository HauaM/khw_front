/**
 * useApiMutation 훅 (선택사항)
 *
 * API 공통 규격 응답을 처리하기 위한 간단한 래퍼
 * React Query의 useMutation을 감싸서 자동 피드백/에러 처리 제공
 *
 * @note 이 훅은 API 응답이 ApiResponse<T> 형식일 때 사용
 * @note 기존 useMutation을 사용해도 되지만, 이 훅을 사용하면 자동 처리 가능
 */

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiResponse, isApiSuccess } from '@/types/api';
import { ApiResponseError, getUserFriendlyErrorMessage } from '@/lib/api/responseHandler';
import { useToast } from './useToast';
import { useFeedback } from './useFeedback';

interface ApiMutationOptions<TData, _TVariables> {
  /** 피드백 메시지 자동 표시 여부 (기본값: true) */
  autoShowFeedback?: boolean;
  /** 에러 메시지 자동 표시 여부 (기본값: true) */
  autoShowError?: boolean;
  /** 성공 메시지 */
  successMessage?: string;
  /** 에러 코드별 커스텀 메시지 */
  errorMessages?: Record<string, string>;
  /** 성공 시 추가 콜백 */
  onApiSuccess?: (data: TData, feedbacks: any[]) => void | Promise<void>;
  /** 에러 시 추가 콜백 */
  onApiError?: (error: ApiResponseError | AxiosError) => void | Promise<void>;
  /** React Query mutation options */
  mutationOptions?: any;
}

/**
 * API 공통 규격 처리 useMutation
 *
 * @example
 * const { mutate, isPending } = useApiMutation(
 *   (data) => api.post('/api/v1/manuals', data),
 *   { successMessage: '저장되었습니다.' }
 * );
 */
export function useApiMutation<TData, _TVariables = void>(
  mutationFn: (variables: _TVariables) => Promise<ApiResponse<TData>>,
  options: ApiMutationOptions<TData, _TVariables> = {}
) {
  const {
    autoShowFeedback = true,
    autoShowError = true,
    successMessage = '작업이 완료되었습니다.',
    errorMessages = {},
    onApiSuccess,
    onApiError,
    mutationOptions = {},
  } = options;

  const toast = useToast();
  const { showFeedbacks } = useFeedback();

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables: _TVariables) => {
      const response = await mutationFn(variables);

      if (!isApiSuccess(response)) {
        throw new ApiResponseError(response);
      }

      const data = response.data;

      // 성공 메시지 표시
      if (successMessage) {
        toast.success(successMessage);
      }

      // 피드백 자동 표시
      if (autoShowFeedback && response.feedback && response.feedback.length > 0) {
        setTimeout(() => {
          showFeedbacks(response.feedback, 200);
        }, 500);
      }

      // 사용자 콜백 호출
      if (onApiSuccess) {
        await onApiSuccess(data, response.feedback || []);
      }

      return data;
    },
    onError: async (error: any) => {
      if (autoShowError) {
        let errorMessage: string;

        if (error instanceof ApiResponseError) {
          const customMessage = errorMessages[error.code];
          errorMessage = customMessage || getUserFriendlyErrorMessage(error);

          if (error.feedbacks && error.feedbacks.length > 0) {
            setTimeout(() => {
              showFeedbacks(error.feedbacks, 200);
            }, 100);
          }
        } else {
          errorMessage = errorMessages['NETWORK_ERROR'] || '요청 처리 중 오류가 발생했습니다.';
        }

        toast.error(errorMessage);
      }

      if (onApiError) {
        await onApiError(error);
      }
    },
  });
}

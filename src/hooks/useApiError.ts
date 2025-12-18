/**
 * useApiError 훅
 *
 * API 에러를 처리하고 분석하는 유틸리티 훅
 * - 에러 코드별 메시지 매핑
 * - 재시도 로직
 * - 에러 상태 관리
 */

import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import { ApiResponseError } from '@/lib/api/responseHandler';
import { API_ERROR_CODES, ApiErrorCode } from '@/types/api';
import { useToast } from './useToast';

interface ApiErrorInfo {
  code: string;
  message: string;
  hint?: string;
  details?: Record<string, any>;
  requestId?: string;
  timestamp?: string;
}

interface ErrorHandlerOptions {
  /** 에러 메시지 자동 표시 여부 */
  autoShow?: boolean;
  /** 커스텀 에러 메시지 매핑 */
  errorMessages?: Record<string, string>;
}

export function useApiError(options: ErrorHandlerOptions = {}) {
  const { autoShow = true, errorMessages = {} } = options;
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  /**
   * 에러 객체 분석 및 정보 추출
   */
  const analyzeError = useCallback((err: ApiResponseError | AxiosError | Error): ApiErrorInfo => {
    if (err instanceof ApiResponseError) {
      return {
        code: err.code,
        message: err.message,
        hint: err.hint,
        details: err.details,
        requestId: err.requestId,
        timestamp: err.timestamp,
      };
    }

    if (err instanceof AxiosError) {
      return {
        code: err.code || 'NETWORK_ERROR',
        message: err.message,
        details: err.response?.data,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: err.message,
    };
  }, []);

  /**
   * 에러를 처리하고 상태에 저장
   */
  const handleError = useCallback(
    (err: ApiResponseError | AxiosError | Error) => {
      const errorInfo = analyzeError(err);
      setError(errorInfo);

      if (autoShow) {
        const customMessage = errorMessages[errorInfo.code];
        const displayMessage = customMessage || errorInfo.hint || errorInfo.message;
        const toastContent = { message: displayMessage, code: errorInfo.code };
        toast.error(toastContent);
      }

      return errorInfo;
    },
    [analyzeError, autoShow, errorMessages, toast]
  );

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * 특정 에러 코드인지 확인
   */
  const isErrorCode = useCallback(
    (code: ApiErrorCode): boolean => {
      return error?.code === code;
    },
    [error]
  );

  /**
   * 인증 관련 에러인지 확인
   */
  const isAuthError = useCallback((): boolean => {
    if (!error) return false;
    return (
      error.code === API_ERROR_CODES.AUTH_INVALID_TOKEN ||
      error.code === API_ERROR_CODES.AUTH_EXPIRED_TOKEN ||
      error.code === API_ERROR_CODES.AUTH_REQUIRED ||
      error.code === API_ERROR_CODES.AUTH_FORBIDDEN
    );
  }, [error]);

  /**
   * 검증 관련 에러인지 확인
   */
  const isValidationError = useCallback((): boolean => {
    if (!error) return false;
    return (
      error.code === API_ERROR_CODES.VALIDATION_ERROR ||
      error.code === API_ERROR_CODES.INVALID_INPUT
    );
  }, [error]);

  /**
   * 리소스 관련 에러인지 확인
   */
  const isResourceError = useCallback((): boolean => {
    if (!error) return false;
    return (
      error.code === API_ERROR_CODES.RESOURCE_NOT_FOUND ||
      error.code === API_ERROR_CODES.RESOURCE_CONFLICT ||
      error.code === API_ERROR_CODES.RESOURCE_ALREADY_EXISTS
    );
  }, [error]);

  /**
   * 서버 에러인지 확인
   */
  const isServerError = useCallback((): boolean => {
    if (!error) return false;
    return (
      error.code === API_ERROR_CODES.SERVER_ERROR ||
      error.code === API_ERROR_CODES.SERVICE_UNAVAILABLE
    );
  }, [error]);

  /**
   * 재시도 가능한 에러인지 확인
   */
  const isRetryable = useCallback((): boolean => {
    if (!error) return false;
    // 서버 에러나 네트워크 에러는 재시도 가능
    return isServerError() || error.code === 'NETWORK_ERROR';
  }, [error, isServerError]);

  /**
   * 재시도 횟수 증가
   */
  const increaseRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  /**
   * 최대 재시도 횟수 도달했는지 확인
   */
  const isMaxRetryReached = useCallback((maxRetries: number = 3): boolean => {
    return retryCount >= maxRetries;
  }, [retryCount]);

  return {
    // 상태
    error,
    retryCount,
    hasError: error !== null,

    // 메서드
    handleError,
    clearError,
    analyzeError,

    // 타입 확인
    isErrorCode,
    isAuthError,
    isValidationError,
    isResourceError,
    isServerError,
    isRetryable,

    // 재시도
    increaseRetry,
    isMaxRetryReached,
  };
}

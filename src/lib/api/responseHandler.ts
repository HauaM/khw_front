/**
 * API 응답 처리 유틸리티
 *
 * 공통 규격의 API 응답을 처리하는 함수들을 정의합니다.
 */

import { AxiosError, AxiosResponse } from 'axios';
import {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  isApiSuccess,
  isApiError,
  ApiFeedback,
} from '@/types/api';

/**
 * API 성공 응답 추출
 *
 * @template T - 응답 데이터 타입
 * @param response - Axios 응답
 * @returns 성공 응답 데이터
 * @throws ApiErrorResponse - API 에러 응답
 */
export function extractApiSuccess<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const apiResponse = response.data;

  if (isApiSuccess(apiResponse)) {
    return apiResponse.data;
  }

  // 실패 응답인 경우 에러 throw
  throw new ApiResponseError(apiResponse);
}

/**
 * API 성공 응답의 전체 정보 (데이터 + 피드백)
 *
 * @template T - 응답 데이터 타입
 * @param response - Axios 응답
 * @returns { data, feedback, meta }
 * @throws ApiErrorResponse - API 에러 응답
 */
export function extractApiWithFeedback<T>(
  response: AxiosResponse<ApiResponse<T>>
): { data: T; feedback: ApiFeedback[]; meta: any } {
  const apiResponse = response.data;

  if (isApiSuccess(apiResponse)) {
    return {
      data: apiResponse.data,
      feedback: apiResponse.feedback,
      meta: apiResponse.meta,
    };
  }

  throw new ApiResponseError(apiResponse);
}

/**
 * API 응답이 성공 응답인지 확인 (타입 가드)
 */
export function isSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return isApiSuccess(response);
}

/**
 * API 응답이 에러 응답인지 확인 (타입 가드)
 */
export function isError(response: ApiResponse<any>): response is ApiErrorResponse {
  return isApiError(response);
}

/**
 * API 에러 응답을 일반 JavaScript Error로 변환
 *
 * @param errorResponse - API 에러 응답
 * @returns Error 인스턴스
 */
export function apiErrorToError(errorResponse: ApiErrorResponse): Error {
  const { error, meta } = errorResponse;
  const message = `[${error.code}] ${error.message}`;
  const err = new Error(message);

  // 에러 객체에 추가 정보 첨부
  Object.assign(err, {
    code: error.code,
    details: error.details,
    hint: error.hint,
    requestId: meta.requestId,
    timestamp: meta.timestamp,
  });

  return err;
}

/**
 * Axios 에러를 API 에러로 변환
 *
 * @param error - Axios 에러
 * @returns API 에러 응답 또는 일반 에러
 */
export function axiosErrorToApiError(error: AxiosError): ApiErrorResponse | null {
  if (error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as any;

    // API 공통 규격 확인
    if ('success' in data && data.success === false && 'error' in data) {
      return data as ApiErrorResponse;
    }
  }

  return null;
}

/**
 * API 에러 응답 커스텀 클래스
 *
 * API 응답 에러를 처리할 때 사용합니다.
 */
export class ApiResponseError extends Error {
  public code: string;
  public details?: Record<string, any>;
  public hint?: string;
  public requestId: string;
  public timestamp: string;
  public feedbacks: ApiFeedback[];

  constructor(errorResponse: ApiErrorResponse) {
    const { error, meta, feedback } = errorResponse;
    super(`[${error.code}] ${error.message}`);
    this.name = 'ApiResponseError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    this.requestId = meta.requestId;
    this.timestamp = meta.timestamp;
    this.feedbacks = feedback;

    // 프로토타입 체인 설정 (TypeScript + ES2015 환경)
    Object.setPrototypeOf(this, ApiResponseError.prototype);
  }
}

/**
 * 에러 응답에서 사용자 친화적 메시지 생성
 *
 * @param error - API 에러 응답
 * @returns 사용자에게 표시할 메시지
 */
export function getUserFriendlyErrorMessage(error: ApiErrorResponse | ApiResponseError): string {
  // ApiResponseError 인스턴스
  if (error instanceof ApiResponseError) {
    return error.hint || error.message;
  }

  // ApiErrorResponse 객체
  if ('error' in error) {
    return error.error.hint || error.error.message;
  }

  return '요청 처리 중 오류가 발생했습니다.';
}

/**
 * 피드백 메시지들을 그룹화 (레벨별)
 *
 * @param feedbacks - 피드백 배열
 * @returns 레벨별 그룹화된 피드백
 */
export function groupFeedbacksByLevel(feedbacks: ApiFeedback[]) {
  return feedbacks.reduce(
    (acc, feedback) => {
      if (!acc[feedback.level]) {
        acc[feedback.level] = [];
      }
      acc[feedback.level].push(feedback);
      return acc;
    },
    {} as Record<string, ApiFeedback[]>
  );
}

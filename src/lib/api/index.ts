/**
 * API 레이어 모듈
 *
 * 모든 API 관련 기능을 한 곳에서 import할 수 있습니다.
 */

// Axios 클라이언트
export { axiosClient, api } from './axiosClient';

// 응답 처리
export {
  extractApiSuccess,
  extractApiWithFeedback,
  isSuccess,
  isError,
  apiErrorToError,
  axiosErrorToApiError,
  getUserFriendlyErrorMessage,
  groupFeedbacksByLevel,
  ApiResponseError,
} from './responseHandler';

// API 함수들
export * from './auth';
export * from './consultations';
export * from './manuals';
export * from './manualReviewTasks';
export * from './commonCodes';
export * from './departments';
export * from './users';

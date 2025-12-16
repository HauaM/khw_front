/**
 * API 공통 응답 규격 타입 정의
 *
 * 백엔드와의 모든 API 응답은 아래 형식을 따릅니다:
 * - 성공: ApiSuccessResponse<T>
 * - 실패: ApiErrorResponse
 */

/** API 피드백 정보 (정보성 메시지, 경고, 팁 등) */
export interface ApiFeedback {
  code: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

/** API 응답 메타데이터 */
export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

/** API 에러 상세 정보 */
export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
  hint?: string;
}

/** ✅ API 성공 응답 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error: null;
  meta: ApiMeta;
  feedback: ApiFeedback[];
}

/** ❌ API 실패 응답 */
export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiErrorDetail;
  meta: ApiMeta;
  feedback: ApiFeedback[];
}

/** API 응답 (성공 | 실패) */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * API 응답이 성공인지 확인하는 타입 가드
 * @param response - API 응답
 * @returns 성공 여부
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * API 응답이 실패인지 확인하는 타입 가드
 * @param response - API 응답
 * @returns 실패 여부
 */
export function isApiError(response: ApiResponse<any>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * API 에러 코드 상수
 * 일반적인 에러 코드들을 정의합니다
 */
export const API_ERROR_CODES = {
  // 인증 관련
  AUTH_INVALID_TOKEN: 'AUTH.INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH.EXPIRED_TOKEN',
  AUTH_REQUIRED: 'AUTH.REQUIRED',
  AUTH_FORBIDDEN: 'AUTH.FORBIDDEN',

  // 검증 관련
  VALIDATION_ERROR: 'VALIDATION.ERROR',
  INVALID_INPUT: 'VALIDATION.INVALID_INPUT',

  // 리소스 관련
  RESOURCE_NOT_FOUND: 'RESOURCE.NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE.CONFLICT',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE.ALREADY_EXISTS',

  // 서버 관련
  SERVER_ERROR: 'SERVER.ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE.UNAVAILABLE',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

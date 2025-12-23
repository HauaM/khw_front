/**
 * TypeScript 타입 정의 모듈
 *
 * 모든 타입을 한 곳에서 import할 수 있습니다.
 */

// API 공통 규격
export type { ApiResponse } from './api';

// 인증 타입 (UserRole은 auth.ts에서만 export)
export type {
  UserRole,
  ApiUser,
  AuthUser,
  TokenResponse,
} from './auth';

// 상담 타입 (BusinessType 제외 - manuals와 충돌)
export type {
  ConsultationDetail,
  ConsultationSearchParams,
} from './consultations';

// 메뉴얼 타입 (BusinessType은 manuals.ts에서만 export)
export type {
  BusinessType,
  ManualBusinessType,
  ManualDraftResponse,
  ManualDetail,
  ManualDraftCreateResponse,
  ManualSearchManual,
} from './manuals';

// ManualListItem은 ManualDetail의 별칭으로 사용
export type { ManualDetail as ManualListItem } from './manuals';

// 리뷰 타입
export type {
  ManualReviewStatus,
  BackendManualReviewTask,
  ManualReviewTask,
} from './reviews';

// 사용자 타입 (UserRole 제외 - auth와 충돌)
export type {
  UserResponse,
  DepartmentResponse,
} from './users';

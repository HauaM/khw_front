# 🔍 KWH 프로젝트 리팩토링 아키텍처 분석 보고서

**작성일:** 2025-12-19
**작성자:** Frontend Architecture Team
**프로젝트:** KWH 지식관리시스템 (광주은행)
**분석 대상:** React 18 + Vite + TypeScript 프론트엔드
**문서 버전:** 1.0

---

## 📋 목차

1. [전체 리팩토링 관점 요약](#1%EF%B8%8F⃣-전체-리팩토링-관점-요약)
2. [리팩토링 검토 체크리스트](#2%EF%B8%8F⃣-리팩토링-검토-체크리스트)
3. [우선순위 기반 리팩토링 로드맵](#3%EF%B8%8F⃣-우선순위-기반-리팩토링-로드맵)
4. [구조적 리팩토링 원칙 요약](#4%EF%B8%8F⃣-구조적-리팩토링-원칙-요약)
5. [실행 계획 및 다음 단계](#5%EF%B8%8F⃣-실행-계획-및-다음-단계)

---

## 1️⃣ 전체 리팩토링 관점 요약

### ✅ 현재 구조의 강점

#### 1. 명확한 레이어 분리 의도
- **아키텍처 흐름**: `pages` → `hooks` → `lib/api` → `Backend API`
- 비즈니스 로직을 훅으로 캡슐화하는 패턴이 대부분의 페이지에 일관되게 적용됨
- API 레이어가 Axios 인스턴스(`axiosClient.ts`)로 중앙 집중화
- 컴포넌트는 props만 받아 렌더링하는 Presentational 패턴 준수

**예시:**
```typescript
// ✅ 좋은 패턴 (ManualEditPage.tsx)
const ManualEditPage: React.FC = () => {
  const { manualId } = useParams();
  const { formData, isLoading, handleSave } = useManualEditForm(manualId);

  if (isLoading) return <Spinner />;
  return <ManualEditForm formData={formData} onSubmit={handleSave} />;
};
```

#### 2. React Query를 통한 서버 상태 관리
- `@tanstack/react-query` 5.17 도입으로 캐싱, 자동 재조회, 낙관적 업데이트 기반 마련
- `useApiQuery`, `useApiMutation` 래퍼로 공통 에러/피드백 처리 추출 시도
- `queryClient.ts`에서 전역 설정 관리 (retry, staleTime, refetchOnWindowFocus)

#### 3. TypeScript 기반 타입 안전성
- `strict: true` 모드 활성화
- API 응답 규격을 `ApiResponse<T>` 인터페이스로 명확히 정의
- DTO(Data Transfer Object)와 UI 모델 분리 시도 (`ApiConsultation` vs `Consultation`)

#### 4. Tailwind CSS 표준화
- 스타일링 규칙이 문서화 (`CLAUDE.md`, `UI_UX_STYLE_GUIDE.md`)
- 색상 팔레트 중앙 관리 (`tailwind.config.js`)
- 인라인 스타일(`style={{}}`) 사용 없음 (✅ 확인됨)

---

### ⚠️ 유지보수 관점에서의 핵심 리스크

#### 🔴 P0 (즉시 개선 필요)

##### 1. React Query 쿼리 키 불일치

**문제:**
- 쿼리 키가 문자열 배열로 각 훅에 흩어져 정의됨
- 일관된 명명 규칙이 없어 오타 발생 시 캐시 미스
- 쿼리 키 변경 시 영향 범위 추적 불가능

**현재 상태:**
```typescript
// hooks/useManualDetail.ts
useQuery({ queryKey: ['manuals', manualId], ... });

// hooks/useManualDraft.ts
useQuery({ queryKey: ['manuals', 'drafts', draftId], ... });

// hooks/useManualSearch.ts
// 쿼리 키 없음 (useState로 관리)
```

**영향:**
- 캐시 무효화 시 오타로 인한 버그 (`invalidateQueries({ queryKey: ['manual'] })` vs `['manuals']`)
- 리팩토링 시 문자열 검색으로 찾아야 하는 번거로움
- 타입 안전성 부재

---

##### 2. 에러 처리 레이어 경계 위반

**문제:**
- `ConsultationSearchPage`에서 Axios 대신 `fetch` 직접 사용 (165-170줄)
- `useManualEditForm`에서 `try-catch` 후 `console.error` 로깅 + Toast만 표시
- `AxiosError`, `ApiResponseError`, `Error`가 혼재되어 UI 레이어로 누출

**현재 코드:**
```typescript
// ❌ ConsultationSearchPage.tsx (165줄)
const res = await fetch(url.toString(), {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
// → axiosClient의 인터셉터(토큰 자동 추가, 401 재시도) 우회

// ❌ useManualEditForm.ts (256-262줄)
catch (error: any) {
  console.error('Failed to save manual:', error);
  const errorMessage = error.response?.data?.detail?.[0]?.msg || '저장에 실패했습니다.';
  showToast(errorMessage, 'error');
}
// → AxiosError 구조에 의존, 옵셔널 체이닝 과다
```

**영향:**
- HTTP 클라이언트 정책 변경 시 변경 범위 증가 (fetch 사용 부분은 수동 수정 필요)
- 에러 타입별 처리 로직이 컴포넌트/훅마다 중복
- 에러 메시지 일관성 보장 어려움

---

##### 3. location.state 의존도 과다

**문제:**
- `ManualDraftResultPage`: location.state로 초안 데이터 전달받음
- `ConsultationSearchPage`: 검색 결과를 sessionStorage에 저장 후 복원 (101-117줄)

**현재 코드:**
```typescript
// ❌ ConsultationDetailPage → ManualDraftResultPage
navigate('/manuals/draft/result', {
  state: { draftData: response.data }
});

// ❌ ConsultationSearchPage (101줄)
useEffect(() => {
  const restoreSessionId = (location.state as any)?.restoreSessionId;
  if (restoreSessionId) {
    const saved = sessionStorage.getItem(restoreSessionId);
    // ... 복원 로직
  }
}, [location.state]);
```

**영향:**
- 새로고침/딥링크 시 데이터 유실 (사용자가 `/manuals/draft/123`에 직접 접근 불가)
- 브라우저 뒤로가기/북마크 불안정
- 상태 복원 로직이 sessionStorage와 location.state로 이중화되어 복잡도 증가

---

#### 🟡 P1 (단기 개선 필요)

##### 4. 훅의 책임 과다 (Fat Hook Anti-pattern)

**문제:**
- `useManualEditForm` 훅이 286줄
- 데이터 로딩 + 폼 상태 관리 + 검증 + API 호출 + 파싱 로직 모두 포함

**파일:** `src/hooks/useManualEditForm.ts`

**구조:**
```typescript
export const useManualEditForm = (manualId: string) => {
  // 1. 데이터 로딩 (useEffect + API 호출)
  useEffect(() => { loadManualData(); }, [manualId]);

  // 2. 폼 상태 (formData, guidelines, keywordInput, errors)
  const [formData, setFormData] = useState<ManualDetail | null>(null);
  const [guidelines, setGuidelines] = useState<ManualGuideline[]>([]);

  // 3. 파싱 로직 (parseGuidelinesFromString, serializeGuidelinesToString)

  // 4. 입력 핸들러 (handleInputChange, handleAddKeyword, ...)

  // 5. 검증 로직 (validateForm)

  // 6. 저장 로직 (handleSave)

  return { /* 14개 값/함수 */ };
};
```

**영향:**
- 단일 책임 원칙(SRP) 위반 → 테스트 어려움
- 다른 페이지에서 재사용 불가능 (예: 조회만 필요한 경우)
- 로직 변경 시 영향 범위 파악 어려움

---

##### 5. API 응답 변환 로직 분산

**문제:**
- `ConsultationSearchPage`에서 API 응답을 UI 모델로 직접 변환 (198-213줄)
- `useManualEditForm`에서 guideline 파싱 로직 내장 (23-57줄)
- 변환 로직이 페이지/훅에 흩어져 있어 일관성 보장 어려움

**현재 코드:**
```typescript
// ❌ ConsultationSearchPage.tsx (198-213줄)
const mapped: Consultation[] = (apiData.results ?? []).map((item) => ({
  id: item.consultation.id,
  branchCode: item.consultation.branch_code,
  branchName: resolveBranchName(item.consultation.branch_code),
  employeeId: item.consultation.employee_id,
  // ... 스네이크 케이스 → 카멜 케이스 변환
  similarityScore: Math.round((item.score || 0) * 100),
}));
```

**영향:**
- API 스펙 변경 시 변경 포인트 증가 (페이지마다 변환 로직 수정 필요)
- snake_case ↔ camelCase 변환이 일관되지 않을 가능성

---

##### 6. HEX 색상 하드코딩 잔존

**문제:**
- 15개 컴포넌트에서 `#005BAC`, `#E0E0E0`, `#F5F7FB` 등 HEX 값 직접 사용
- `CLAUDE.md`에서 "HEX 하드코딩 금지" 명시했으나 준수되지 않음

**영향:**
- 브랜드 색상 변경 시 전체 검색/수정 필요
- Tailwind 설정(`tailwind.config.js`)과 불일치 가능성

**해당 파일 목록:**
```
src/components/consultations/ConsultationDetailBasicInfo.tsx
src/components/manuals/ManualDraftResultView.tsx
src/components/modals/ConsultationDetailModal.tsx
src/components/common/TypeAheadSelectBox.tsx
src/components/consultations/ConsultationCreateForm.tsx
src/components/auth/LoginForm.tsx
src/components/manuals/ManualSearchForm.tsx
src/components/common/AuthLayout.tsx
src/components/manuals/ManualSearchResults.tsx
src/components/manuals/ManualEditForm.tsx
src/components/common/Modal.tsx
src/components/consultations/ConsultationMetadataTable.tsx
src/components/consultations/ConsultationDetailContent.tsx
src/components/consultations/MetadataFields.tsx
src/components/auth/RegisterForm.tsx
```

---

#### 🟢 P2 (중장기 개선 고려)

##### 7. React Query 캐싱 전략 부재

**문제:**
- `staleTime: 5분` 전역 설정만 존재 (`queryClient.ts`)
- 쿼리별 캐싱 전략 차별화 없음

**현재 설정:**
```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 모든 쿼리 5분
    },
  },
});
```

**개선 필요:**
- 자주 변경되는 데이터 (draft): `staleTime: 1분`
- 거의 변경 안 되는 데이터 (approved manual): `staleTime: 30분`
- 공통코드: `staleTime: 1시간`

---

##### 8. 컴포넌트 재사용 경계 모호

**문제:**
- `ManualSearchResults`가 `formatDate` 유틸 함수 내장 (14-20줄)
- 테이블 렌더링 로직이 여러 컴포넌트에 중복 (ConsultationResultTable, ManualSearchResults 등)

**영향:**
- 유틸 함수 재정의 → DRY 원칙 위반
- 테이블 스타일 변경 시 여러 파일 수정 필요

---

## 2️⃣ 리팩토링 검토 체크리스트

### A. Folder & Layer Boundaries (폴더 및 레이어 경계)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **Pages 역할** | 🟡 대체로 준수 | `ConsultationSearchPage`가 API 호출 + 변환 로직 직접 구현 (138-253줄) | API 변경 시 페이지 코드 수정 필요 | fetch 로직을 `lib/api/consultations.ts`로 이동 |
| **Components 순수성** | ✅ 양호 | `ManualSearchResults`가 날짜 포맷팅 로직 내장 | 유틸 함수 중복 가능성 | `lib/utils/dateFormatter.ts`로 통합 |
| **Hooks 책임** | 🔴 위반 | `useManualEditForm`이 폼 상태 + API + 검증 + 파싱 동시 처리 (286줄) | 재사용 불가, 테스트 어려움 | 역할별 훅 분리 (조회/상태/검증/저장) |
| **API Layer 중앙화** | 🔴 위반 | `ConsultationSearchPage`에서 직접 `fetch` 사용 | 인터셉터 정책 우회, 일관성 깨짐 | 모든 HTTP 통신은 `axiosClient` 사용 |

**개선 작업:**
1. `ConsultationSearchPage`의 fetch 로직을 `lib/api/consultations.ts`로 이동
2. `useManualEditForm`을 다음과 같이 분리:
   - `useManualData(id)`: 조회 전용
   - `useManualFormState()`: 폼 상태 관리
   - `useManualValidation()`: 검증 로직
   - `useSaveManual()`: mutation
3. 날짜 포맷팅을 `lib/utils/dateFormatter.ts`로 통합

---

### B. React Query Strategy (React Query 전략)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **쿼리 키 일관성** | 🔴 위반 | 쿼리 키가 문자열로 흩어져 정의됨 | 오타, 변경 추적 불가 | 쿼리 키 팩토리 패턴 도입 |
| **무효화 전략** | 🟡 불명확 | `invalidateQueries({ queryKey: ['manuals'] })` 같은 광범위 무효화 | 불필요한 재조회 증가 | 세밀한 키 구조로 특정 쿼리만 무효화 |
| **불안정한 객체 키** | ⚠️ 가능성 | `params` 객체를 직접 키로 사용할 경우 참조 문제 | 캐시 미스 발생 | 객체 키는 직렬화 또는 고정된 팩토리 사용 |

**개선 작업: 쿼리 키 팩토리 패턴 도입**

```typescript
// lib/queryKeys.ts (신규 생성)
export const queryKeys = {
  manuals: {
    all: ['manuals'] as const,
    lists: () => [...queryKeys.manuals.all, 'list'] as const,
    drafts: () => [...queryKeys.manuals.all, 'drafts'] as const,
    draft: (id: string) => [...queryKeys.manuals.drafts(), id] as const,
    detail: (id: string) => [...queryKeys.manuals.all, 'detail', id] as const,
    search: (params: ManualSearchParams) =>
      [...queryKeys.manuals.all, 'search', params] as const,
  },
  consultations: {
    all: ['consultations'] as const,
    search: (params: ConsultationSearchParams) =>
      [...queryKeys.consultations.all, 'search', params] as const,
    detail: (id: string) =>
      [...queryKeys.consultations.all, 'detail', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    tasks: () => [...queryKeys.reviews.all, 'tasks'] as const,
    detail: (id: string) => [...queryKeys.reviews.all, 'detail', id] as const,
  },
  commonCodes: {
    all: ['commonCodes'] as const,
    groups: () => [...queryKeys.commonCodes.all, 'groups'] as const,
  },
} as const;

// 사용 예시 (hooks/useManualDetail.ts)
export const useManualDetail = (manualId: string) => {
  return useQuery({
    queryKey: queryKeys.manuals.detail(manualId),
    queryFn: () => getManualDetail(manualId),
  });
};

// 무효화 시
queryClient.invalidateQueries({ queryKey: queryKeys.manuals.drafts() });
```

**장점:**
- 타입 안전성 확보 (`as const` 사용)
- 오타 방지 (IDE 자동완성)
- 리팩토링 시 변경 추적 용이
- 계층 구조로 세밀한 무효화 가능

---

### C. API & Error Handling (API 및 에러 처리)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **Axios 단일 출처** | 🔴 위반 | `ConsultationSearchPage`에서 fetch 직접 사용 | 토큰 인터셉터 우회 | 모든 HTTP는 axiosClient 사용 |
| **에러 타입 표준화** | 🔴 위반 | AxiosError, ApiResponseError, Error 혼재 | UI 레이어마다 에러 처리 중복 | 통합 AppError 클래스 도입 |
| **에러 메시지 일관성** | 🟡 불명확 | `error.response?.data?.detail?.[0]?.msg` 같은 옵셔널 체이닝 과다 | null 참조 위험 | 에러 정규화 함수 |

**개선 작업: 통합 에러 타입 정의**

```typescript
// lib/api/errors.ts (신규 생성)
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public hint?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 모든 에러를 AppError로 정규화
 */
export function normalizeApiError(error: unknown): AppError {
  // 1. ApiResponseError (백엔드 공통 규격)
  if (error instanceof ApiResponseError) {
    return new AppError(
      error.code,
      error.message,
      error.hint
    );
  }

  // 2. AxiosError (네트워크/HTTP 에러)
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;

    return new AppError(
      'NETWORK_ERROR',
      message,
      statusCode === 500 ? '서버 오류입니다. 잠시 후 다시 시도해주세요.' : undefined,
      statusCode
    );
  }

  // 3. 일반 Error
  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', error.message);
  }

  // 4. 기타
  return new AppError('UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.');
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(appError: AppError): string {
  const codeMessages: Record<string, string> = {
    'AUTH.INVALID_TOKEN': '로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.',
    'AUTH.EXPIRED_TOKEN': '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
    'VALIDATION.ERROR': '입력한 정보를 확인해주세요.',
    'RESOURCE.NOT_FOUND': '요청한 데이터를 찾을 수 없습니다.',
    'NETWORK_ERROR': '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
  };

  return appError.hint || codeMessages[appError.code] || appError.message;
}
```

**사용 예시:**

```typescript
// hooks/useManualDetail.ts
export const useManualDetail = (manualId: string) => {
  return useQuery({
    queryKey: queryKeys.manuals.detail(manualId),
    queryFn: () => getManualDetail(manualId),
    // React Query는 에러를 그대로 전달
  });
};

// pages/ManualDetailPage.tsx
const ManualDetailPage: React.FC = () => {
  const { manualId } = useParams();
  const { data, isLoading, error } = useManualDetail(manualId!);

  if (error) {
    const appError = normalizeApiError(error);
    return (
      <ErrorState
        message={getUserFriendlyMessage(appError)}
        hint={appError.hint}
      />
    );
  }

  // ...
};
```

**장점:**
- UI 레이어는 `AppError` 하나만 처리
- AxiosError, ApiResponseError 타입 의존성 제거
- 에러 메시지 일관성 보장
- 테스트 시 AppError만 모킹하면 됨

---

### D. Routing & State Transfer (라우팅 및 상태 전달)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **location.state 의존** | 🔴 심각 | 초안 데이터를 location.state로 전달 | 새로고침 시 데이터 유실 | 서버 데이터 refetch로 전환 |
| **세션 스토리지 남용** | 🔴 심각 | 검색 결과를 sessionStorage에 저장 후 복원 | 메모리 누수, 동기화 문제 | URL params + React Query 캐시 |
| **딥링크 지원** | 🔴 불가능 | `/manuals/draft/:id`에 직접 접근 불가 | 사용자 경험 저하, 북마크 불가 | URL에 모든 상태 포함 |

**현재 문제 코드:**

```typescript
// ❌ ConsultationDetailPage → ManualDraftResultPage
const handleCreateDraft = async () => {
  const response = await createManualDraft({ consultation_id: id });
  navigate('/manuals/draft/result', {
    state: { draftData: response.data }  // location.state 의존
  });
};

// ❌ ManualDraftResultPage
const ManualDraftResultPage: React.FC = () => {
  const location = useLocation();
  const draftData = location.state?.draftData;  // 새로고침 시 null

  if (!draftData) {
    return <div>데이터가 없습니다</div>;  // 사용자 혼란
  }
  // ...
};
```

**개선 작업:**

```typescript
// ✅ ConsultationDetailPage
const handleCreateDraft = async () => {
  const response = await createManualDraft({ consultation_id: id });
  const draftId = response.data.id;

  // 1. React Query 캐시에 미리 저장 (prefetch)
  queryClient.setQueryData(
    queryKeys.manuals.draft(draftId),
    response.data
  );

  // 2. URL만 전달 (location.state 제거)
  navigate(`/manuals/draft/${draftId}`);
};

// ✅ ManualDraftResultPage
const ManualDraftResultPage: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();

  // 서버 데이터 조회 (캐시에 있으면 즉시 반환)
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.manuals.draft(draftId!),
    queryFn: () => getManualDraft(draftId!),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 유지
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={normalizeApiError(error)} />;

  return <ManualDraftResultView draft={data} />;
};
```

**장점:**
- 새로고침/딥링크 지원
- 북마크 가능
- sessionStorage 제거 (메모리 누수 방지)
- React Query 캐시 활용으로 불필요한 API 호출 최소화

---

### E. Component Reusability Boundaries (컴포넌트 재사용 경계)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **common 컴포넌트 순수성** | 🟡 대체로 양호 | `TypeAheadSelectBox` 등 범용 UI | - | - |
| **도메인 로직 혼입** | ⚠️ 가능성 | `ManualSearchResults`에 날짜 포맷팅 내장 | 유틸 함수 재정의 | `lib/utils`로 분리 |
| **Props 과다 추상화** | ✅ 없음 | - | - | - |

**개선 작업:**

```typescript
// lib/utils/dateFormatter.ts (통합)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// components/manuals/ManualSearchResults.tsx
import { formatDate } from '@/lib/utils/dateFormatter';

const ManualSearchResults: React.FC<ManualSearchResultsProps> = ({ results }) => {
  return (
    <td>{formatDate(result.manual.updated_at)}</td>
  );
};
```

---

### F. Tailwind CSS Discipline (Tailwind CSS 규율)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **HEX 하드코딩** | 🔴 위반 | 15개 파일에서 `#005BAC`, `#E0E0E0` 사용 | 브랜드 색상 변경 어려움 | Tailwind 클래스로 일괄 치환 |
| **인라인 스타일** | ✅ 없음 | `style={{}}` 사용 없음 | - | - |
| **클래스 중복** | 🟡 일부 | `bg-white rounded-lg shadow-sm border` 반복 | - | Card 컴포넌트로 추출 고려 |

**HEX 값 사용 예시:**

```typescript
// ❌ ManualSearchResults.tsx (42줄)
<span className="font-bold text-[#005BAC]">{safeResults.length}</span>

// ❌ ManualSearchResults.tsx (128줄)
className="inline-flex whitespace-nowrap items-center rounded bg-[#E8F1FB] px-2 py-0.5 text-[12px] font-semibold text-[#005BAC]"

// ❌ ManualSearchResults.tsx (160줄)
className="h-full rounded-full bg-[#005BAC] transition-all duration-300"
```

**개선 작업:**

```bash
# 1. HEX 값 → Tailwind 클래스 매핑
#005BAC → text-primary-500 / bg-primary-500
#E8F1FB → bg-primary-50
#E0E0E0 → border-gray-200 / bg-gray-200
#F5F7FB → bg-gray-50
#F5F5F5 → bg-gray-100

# 2. 일괄 치환 (예시)
# text-[#005BAC] → text-primary-500
# bg-[#005BAC] → bg-primary-500
```

**린트 규칙 추가 (선택사항):**

```javascript
// .eslintrc.cjs
module.exports = {
  rules: {
    // Tailwind arbitrary 값 금지
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/#[0-9A-Fa-f]{6}/]',
        message: 'HEX 색상 하드코딩 금지. Tailwind 클래스를 사용하세요.',
      },
    ],
  },
};
```

---

### G. Types & Domain Models (타입 및 도메인 모델)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **API DTO vs UI 모델** | 🟡 일부 분리 | `ApiConsultation` vs `Consultation` 분리는 좋으나, 페이지 내부에 정의 | 타입 재사용 불가 | `types/` 폴더로 이동 |
| **any 사용** | 🔴 존재 | `useApiQuery`의 `queryKey: any[]`, `response.data as any` | 타입 안전성 저하 | 제네릭으로 타입 명시 |
| **enum 활용** | 🟡 부족 | `status`, `businessType` 등을 string으로 처리 | 오타 가능성 | enum으로 변경 |

**개선 작업:**

```typescript
// types/consultations.ts
export enum BusinessType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  LOAN = 'LOAN',
  OTHER = 'OTHER',
}

export enum ManualStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ❌ 현재
type ManualDraftStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';
if (formData.status !== 'DRAFT') { ... }  // 오타 가능

// ✅ 개선
type ManualDraftStatus = ManualStatus;
if (formData.status !== ManualStatus.DRAFT) { ... }  // 타입 안전
```

**API DTO 타입 분리:**

```typescript
// types/consultations.ts
// 백엔드 응답 (snake_case)
export interface ApiConsultation {
  id: string;
  branch_code: string;
  employee_id?: string;
  employee_name?: string;
  business_type: string | null;
  error_code: string | null;
  inquiry_text: string;
  created_at: string;
}

// UI 모델 (camelCase)
export interface Consultation {
  id: string;
  branchCode: string;
  branchName: string;
  employeeId?: string;
  employeeName?: string;
  businessType: BusinessType;
  errorCode: string;
  inquiryText: string;
  createdAt: string;
}

// lib/api/transformers/consultationTransformer.ts
export function toConsultationModel(api: ApiConsultation): Consultation {
  return {
    id: api.id,
    branchCode: api.branch_code,
    branchName: resolveBranchName(api.branch_code),
    employeeId: api.employee_id,
    employeeName: api.employee_name,
    businessType: (api.business_type || 'OTHER') as BusinessType,
    errorCode: api.error_code || '',
    inquiryText: api.inquiry_text,
    createdAt: api.created_at,
  };
}
```

---

### H. Safety for Refactoring (리팩토링 안전성)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **린트 규칙 엄격성** | ✅ 양호 | `--max-warnings 0` 설정 | - | - |
| **빌드 타임 타입 체크** | ✅ 양호 | `tsc && vite build` | - | - |
| **테스트 부재** | 🔴 심각 | 테스트 파일 없음 | 리팩토링 시 회귀 위험 | Vitest + Testing Library 도입 |
| **CI/CD** | ⚠️ 불명확 | 문서에 언급 없음 | - | GitHub Actions 설정 |

**개선 작업: 최소한의 테스트 도입**

```typescript
// tests/hooks/useManualDetail.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useManualDetail } from '@/hooks/useManualDetail';
import { getManualDetail } from '@/lib/api/manuals';

jest.mock('@/lib/api/manuals');

describe('useManualDetail', () => {
  it('should fetch manual detail successfully', async () => {
    const mockData = { id: '123', topic: 'Test Manual' };
    (getManualDetail as jest.Mock).mockResolvedValue({ data: mockData });

    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useManualDetail('123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
```

**CI 설정 (.github/workflows/ci.yml):**

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm test  # 테스트 추가 시
```

---

### I. Performance & Render Structure (성능 및 렌더 구조)

| 항목 | 현황 | 문제 징후 | 유지보수 영향 | 개선 방향 |
|------|------|-----------|--------------|----------|
| **불필요한 리렌더** | 🟡 가능성 | 인라인 함수 정의, deps 배열 불안정 | 성능 저하 가능성 | useCallback 적절히 사용 |
| **memoization 과다** | ✅ 없음 | useMemo/useCallback 적절히 사용 | - | - |
| **대용량 리스트** | ⚠️ 미구현 | 검색 결과 가상화 없음 (top_k=20으로 제한) | 향후 스케일링 고려 | react-window 고려 (필요 시) |

**현재 상태:**
- 검색 결과가 `top_k=20`으로 제한되어 성능 문제 없음
- 향후 페이지네이션 구현 시 검토 필요

---

## 3️⃣ 우선순위 기반 리팩토링 로드맵

### 🔴 P0: 즉시 개선 (1~2주 소요)

**목표:** 아키텍처 안정성 확보, 변경 반경 최소화

---

#### Task 1: React Query 쿼리 키 팩토리 패턴 도입

**Why (왜 중요한가):**
- 쿼리 키 오타/불일치로 인한 캐시 무효화 버그 방지
- 타입 안전성 확보로 리팩토링 안전성 향상
- IDE 자동완성으로 개발 생산성 증가

**How (어떻게 할 것인가):**

1. `lib/queryKeys.ts` 파일 생성
   ```typescript
   export const queryKeys = {
     manuals: {
       all: ['manuals'] as const,
       lists: () => [...queryKeys.manuals.all, 'list'] as const,
       drafts: () => [...queryKeys.manuals.all, 'drafts'] as const,
       draft: (id: string) => [...queryKeys.manuals.drafts(), id] as const,
       detail: (id: string) => [...queryKeys.manuals.all, 'detail', id] as const,
     },
     consultations: { /* ... */ },
     reviews: { /* ... */ },
   } as const;
   ```

2. 모든 훅에서 문자열 배열 → `queryKeys.*` 사용으로 변경
   ```typescript
   // ❌ Before
   useQuery({ queryKey: ['manuals', manualId], ... });

   // ✅ After
   useQuery({ queryKey: queryKeys.manuals.detail(manualId), ... });
   ```

3. 무효화 코드 수정
   ```typescript
   // ❌ Before
   queryClient.invalidateQueries({ queryKey: ['manuals'] });

   // ✅ After
   queryClient.invalidateQueries({ queryKey: queryKeys.manuals.drafts() });
   ```

**예상 소요:** 3일
**변경 파일:** `hooks/*.ts` (23개 파일), 영향 반경 중간
**담당:** Frontend Team
**검증:** 린트 통과, 빌드 성공, 기존 기능 정상 동작 확인

---

#### Task 2: API 레이어 일원화

**Why:**
- `fetch` 직접 사용으로 인한 인터셉터 우회 제거
- 토큰 자동 추가, 401 재시도 로직 일관성 보장
- API 클라이언트 변경 시 변경 범위 최소화

**How:**

1. `ConsultationSearchPage`의 fetch 로직을 `lib/api/consultations.ts`로 이동
   ```typescript
   // lib/api/consultations.ts
   export const searchConsultations = async (
     params: ConsultationSearchParams
   ): Promise<ConsultationSearchResult> => {
     const response = await api.get('/api/v1/consultations/search', {
       params: {
         query: params.query,
         branch_code: params.branchCode,
         business_type: params.businessType,
         error_code: params.errorCode,
         start_date: params.startDate,
         end_date: params.endDate,
         top_k: params.itemsPerPage || 20,
       }
     });
     return response.data;
   };
   ```

2. 페이지에서는 `useQuery`로만 호출
   ```typescript
   // pages/consultations/ConsultationSearchPage.tsx
   const { data, isLoading, error } = useQuery({
     queryKey: queryKeys.consultations.search(searchParams),
     queryFn: () => searchConsultations(searchParams),
     enabled: !!searchParams?.query,
   });
   ```

**예상 소요:** 2일
**변경 파일:** `ConsultationSearchPage.tsx`, `lib/api/consultations.ts`
**담당:** Frontend Team
**검증:** 검색 기능 정상 동작, 토큰 헤더 자동 추가 확인

---

#### Task 3: 통합 에러 타입 정의

**Why:**
- AxiosError, ApiResponseError, Error 혼재로 인한 UI 레이어 복잡도 제거
- 에러 메시지 일관성 보장
- 에러 처리 로직 중복 제거

**How:**

1. `lib/api/errors.ts` 생성
   ```typescript
   export class AppError extends Error {
     constructor(
       public code: string,
       message: string,
       public hint?: string,
       public statusCode?: number
     ) {
       super(message);
       this.name = 'AppError';
     }
   }

   export function normalizeApiError(error: unknown): AppError { /* ... */ }
   export function getUserFriendlyMessage(appError: AppError): string { /* ... */ }
   ```

2. 모든 훅/페이지에서 에러 정규화 적용
   ```typescript
   // pages/ManualDetailPage.tsx
   if (error) {
     const appError = normalizeApiError(error);
     return <ErrorState message={getUserFriendlyMessage(appError)} />;
   }
   ```

3. Toast, 에러 바운더리에서 AppError만 처리

**예상 소요:** 4일
**변경 파일:** 전역 (hooks, pages, components 일부)
**담당:** Frontend Team
**검증:** 다양한 에러 시나리오 테스트 (401, 500, 네트워크 오류 등)

---

#### Task 4: location.state 제거 - 서버 데이터 refetch로 전환

**Why:**
- 새로고침/딥링크 지원으로 사용자 경험 개선
- sessionStorage 제거로 메모리 관리 간소화
- 상태 복원 로직 제거로 코드 복잡도 감소

**How:**

1. `ManualDraftResultPage`: location.state 대신 useQuery로 draft 조회
   ```typescript
   // ❌ Before
   const draftData = location.state?.draftData;

   // ✅ After
   const { draftId } = useParams();
   const { data, isLoading } = useQuery({
     queryKey: queryKeys.manuals.draft(draftId!),
     queryFn: () => getManualDraft(draftId!),
     staleTime: 5 * 60 * 1000,
   });
   ```

2. 초안 생성 후 React Query 캐시에 prefetch
   ```typescript
   // ConsultationDetailPage
   const handleCreateDraft = async () => {
     const response = await createManualDraft({ consultation_id: id });
     const draftId = response.data.id;

     // 캐시에 저장 (즉시 렌더링 가능)
     queryClient.setQueryData(
       queryKeys.manuals.draft(draftId),
       response.data
     );

     navigate(`/manuals/draft/${draftId}`);  // state 제거
   };
   ```

3. `ConsultationSearchPage`: sessionStorage 제거, URL params로 검색 조건 관리
   ```typescript
   // URL: /consultations/search?query=키워드&branch=001
   const [searchParams, setSearchParams] = useSearchParams();

   const handleSearch = (params: ConsultationSearchParams) => {
     setSearchParams({
       query: params.query,
       branch: params.branchCode || '',
       // ...
     });
   };
   ```

**예상 소요:** 5일
**변경 파일:** `ManualDraftResultPage`, `ConsultationSearchPage`, `ConsultationDetailPage`, 관련 훅
**담당:** Frontend Team
**검증:**
- `/manuals/draft/123` 직접 접근 테스트
- 새로고침 후 데이터 유지 확인
- 브라우저 뒤로가기 정상 동작

---

### 🟡 P1: 단기 개선 (1개월 소요)

**목표:** 코드 재사용성 향상, 유지보수 편의성 개선

---

#### Task 5: Fat Hook 분리

**Why:**
- 단일 책임 원칙(SRP) 준수
- 테스트 용이성 향상
- 재사용성 증가 (조회만 필요한 경우 별도 사용 가능)

**How:**

`useManualEditForm` (286줄)을 다음과 같이 분리:

```typescript
// 1. hooks/useManualData.ts (조회 전용)
export const useManualData = (manualId: string) => {
  return useQuery({
    queryKey: queryKeys.manuals.detail(manualId),
    queryFn: () => getManualDetail(manualId),
  });
};

// 2. hooks/useManualFormState.ts (폼 상태 관리)
export const useManualFormState = (initialData: ManualDetail | null) => {
  const [formData, setFormData] = useState(initialData);
  const [guidelines, setGuidelines] = useState<ManualGuideline[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (field: string, value: string) => { /* ... */ };
  const handleAddKeyword = () => { /* ... */ };
  // ...

  return { formData, guidelines, keywordInput, handleInputChange, /* ... */ };
};

// 3. hooks/useManualValidation.ts (검증)
export const useManualValidation = () => {
  const validateForm = (formData: ManualDetail, guidelines: ManualGuideline[]) => {
    const errors: ManualEditErrors = {};
    // 검증 로직
    return errors;
  };

  return { validateForm };
};

// 4. hooks/useSaveManual.ts (mutation)
export const useSaveManual = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: ManualUpdatePayload) => updateManual(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manuals.detail(data.id) });
      showToast('저장되었습니다', 'success');
    },
  });
};

// 5. pages/ManualEditPage.tsx (조합)
const ManualEditPage: React.FC = () => {
  const { manualId } = useParams();
  const { data, isLoading } = useManualData(manualId!);
  const { formData, handleInputChange, ... } = useManualFormState(data);
  const { validateForm } = useManualValidation();
  const { mutate: saveManual } = useSaveManual();

  const handleSave = () => {
    const errors = validateForm(formData, guidelines);
    if (Object.keys(errors).length === 0) {
      saveManual({ id: manualId, ...formData });
    }
  };

  // ...
};
```

**예상 소요:** 6일
**변경 파일:** `hooks/useManualEditForm.ts` (분리), `ManualEditPage.tsx`
**담당:** Frontend Team

---

#### Task 6: API 응답 변환 로직 중앙화

**Why:**
- API 스펙 변경 시 변경 포인트 단일화
- snake_case ↔ camelCase 변환 일관성 보장
- 페이지/컴포넌트에서 변환 로직 제거

**How:**

1. `lib/api/transformers/` 폴더 생성
   ```
   lib/api/transformers/
   ├── consultationTransformer.ts
   ├── manualTransformer.ts
   └── reviewTransformer.ts
   ```

2. 변환 함수 구현
   ```typescript
   // lib/api/transformers/consultationTransformer.ts
   export function toConsultationModel(api: ApiConsultation): Consultation {
     return {
       id: api.id,
       branchCode: api.branch_code,
       branchName: resolveBranchName(api.branch_code),
       employeeId: api.employee_id,
       businessType: (api.business_type || 'OTHER') as BusinessType,
       // ...
       similarityScore: Math.round((api.score || 0) * 100),
       createdAt: api.created_at,
     };
   }
   ```

3. API 함수에서 변환 적용
   ```typescript
   // lib/api/consultations.ts
   export const searchConsultations = async (params: ConsultationSearchParams) => {
     const response = await api.get('/api/v1/consultations/search', { params });

     // 변환 로직 적용
     return {
       results: response.data.results.map(item =>
         toConsultationModel(item.consultation)
       ),
       totalFound: response.data.total_found,
     };
   };
   ```

4. 페이지에서 변환 로직 제거
   ```typescript
   // ❌ Before (ConsultationSearchPage.tsx)
   const mapped: Consultation[] = (apiData.results ?? []).map((item) => ({
     id: item.consultation.id,
     branchCode: item.consultation.branch_code,
     // ... 198-213줄의 변환 로직
   }));

   // ✅ After
   const { data } = useQuery({
     queryKey: queryKeys.consultations.search(params),
     queryFn: () => searchConsultations(params),
   });
   // data는 이미 Consultation[] 타입
   ```

**예상 소요:** 5일
**변경 파일:** `lib/api/*.ts`, `ConsultationSearchPage`, `useManualEditForm`
**담당:** Frontend Team

---

#### Task 7: HEX 색상 일괄 치환

**Why:**
- 브랜드 색상 변경 시 일관성 보장
- Tailwind 설정과 일치시켜 유지보수 편의성 향상

**How:**

1. HEX 값 → Tailwind 클래스 매핑 테이블 작성
   ```
   #005BAC → text-primary-500 / bg-primary-500
   #00437F → text-primary-600 / bg-primary-600
   #E8F1FB → bg-primary-50
   #E0E0E0 → border-gray-200 / bg-gray-200
   #F5F7FB → bg-gray-50
   #F5F5F5 → bg-gray-100
   #111827 → text-gray-900
   #4b5563 → text-gray-600
   ```

2. 15개 파일에서 일괄 치환
   ```bash
   # 예시: text-[#005BAC] → text-primary-500
   find src/components -name "*.tsx" -exec sed -i 's/text-\[#005BAC\]/text-primary-500/g' {} \;
   ```

3. 린트 규칙 추가 (선택사항)
   ```javascript
   // .eslintrc.cjs
   rules: {
     'no-restricted-syntax': [
       'error',
       {
         selector: 'Literal[value=/#[0-9A-Fa-f]{6}/]',
         message: 'HEX 색상 하드코딩 금지. Tailwind 클래스를 사용하세요.',
       },
     ],
   }
   ```

**예상 소요:** 3일
**변경 파일:** `components/*.tsx` (15개)
**담당:** Frontend Team
**검증:** UI 변경 없음 확인 (스크린샷 비교)

---

### 🟢 P2: 중장기 개선 (2~3개월 소요)

**목표:** 성능 최적화, 확장성 확보, 장기 유지보수성 강화

---

#### Task 8: 쿼리별 캐싱 전략 차별화

**Why:**
- 불필요한 API 재호출 방지
- stale 데이터 최소화
- 사용자 경험 개선 (로딩 시간 단축)

**How:**

```typescript
// hooks/useManualDraft.ts
export const useManualDraft = (draftId: string) => {
  return useQuery({
    queryKey: queryKeys.manuals.draft(draftId),
    queryFn: () => getManualDraft(draftId),
    staleTime: 1 * 60 * 1000, // 1분 (자주 변경됨)
    gcTime: 5 * 60 * 1000,    // 5분 후 GC
  });
};

// hooks/useManualDetail.ts (승인된 메뉴얼)
export const useManualDetail = (manualId: string) => {
  return useQuery({
    queryKey: queryKeys.manuals.detail(manualId),
    queryFn: () => getManualDetail(manualId),
    staleTime: 30 * 60 * 1000, // 30분 (거의 변경 안 됨)
    gcTime: 60 * 60 * 1000,    // 1시간 후 GC
  });
};

// hooks/useCommonCodes.ts
export const useCommonCodes = () => {
  return useQuery({
    queryKey: queryKeys.commonCodes.all(),
    queryFn: () => getCommonCodes(),
    staleTime: 60 * 60 * 1000, // 1시간 (거의 변경 안 됨)
    gcTime: 24 * 60 * 60 * 1000, // 24시간 후 GC
  });
};
```

**무효화 전략 세밀화:**

```typescript
// ❌ Before (광범위 무효화)
queryClient.invalidateQueries({ queryKey: ['manuals'] });
// → 모든 메뉴얼 관련 쿼리 무효화 (draft, detail, search 모두)

// ✅ After (특정 쿼리만 무효화)
queryClient.invalidateQueries({ queryKey: queryKeys.manuals.draft(draftId) });
// → 특정 draft만 무효화
```

**예상 소요:** 4일
**담당:** Frontend Team

---

#### Task 9: 컴포넌트 재사용 라이브러리 구축

**Why:**
- 테이블, 카드, 배지 등 반복 패턴 추출
- UI 일관성 보장
- 개발 속도 향상

**How:**

1. `components/ui/` 폴더 생성
   ```
   components/ui/
   ├── Card.tsx         # bg-white rounded-lg shadow-sm border
   ├── Badge.tsx        # 상태, 키워드 배지
   ├── DataTable.tsx    # 범용 테이블 컴포넌트
   ├── Button.tsx       # 버튼 variants
   └── EmptyState.tsx   # 빈 상태 UI
   ```

2. 범용 컴포넌트 구현
   ```typescript
   // components/ui/Card.tsx
   interface CardProps {
     children: React.ReactNode;
     className?: string;
   }

   export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
     return (
       <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
         {children}
       </div>
     );
   };

   // components/ui/Badge.tsx
   type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error';

   export const Badge: React.FC<{ children: React.ReactNode; variant: BadgeVariant }> = ({ children, variant }) => {
     const variantClasses = {
       primary: 'bg-primary-50 text-primary-600',
       secondary: 'bg-gray-100 text-gray-700',
       success: 'bg-green-50 text-green-600',
       error: 'bg-red-50 text-red-600',
     };

     return (
       <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${variantClasses[variant]}`}>
         {children}
       </span>
     );
   };
   ```

3. 기존 컴포넌트에서 사용
   ```typescript
   // ❌ Before
   <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
     내용
   </div>

   // ✅ After
   <Card>내용</Card>
   ```

4. Storybook 도입 검토 (선택사항)

**예상 소요:** 2주
**담당:** Frontend Team

---

#### Task 10: 핵심 훅 단위 테스트

**Why:**
- 리팩토링 시 회귀 방지
- 버그 조기 발견
- 코드 품질 보장

**How:**

1. Vitest + Testing Library 설정
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```

2. 테스트 설정 파일
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './tests/setup.ts',
     },
   });
   ```

3. 핵심 훅 테스트 작성
   ```typescript
   // tests/hooks/useManualDetail.test.ts
   import { renderHook, waitFor } from '@testing-library/react';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { useManualDetail } from '@/hooks/useManualDetail';
   import { getManualDetail } from '@/lib/api/manuals';

   jest.mock('@/lib/api/manuals');

   describe('useManualDetail', () => {
     it('should fetch manual detail successfully', async () => {
       const mockData = { id: '123', topic: 'Test Manual', keywords: [] };
       (getManualDetail as jest.Mock).mockResolvedValue({ data: mockData });

       const queryClient = new QueryClient();
       const wrapper = ({ children }) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
       );

       const { result } = renderHook(() => useManualDetail('123'), { wrapper });

       await waitFor(() => expect(result.current.isSuccess).toBe(true));
       expect(result.current.data).toEqual(mockData);
     });

     it('should handle error', async () => {
       (getManualDetail as jest.Mock).mockRejectedValue(new Error('Network Error'));

       const queryClient = new QueryClient();
       const wrapper = ({ children }) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
       );

       const { result } = renderHook(() => useManualDetail('123'), { wrapper });

       await waitFor(() => expect(result.current.isError).toBe(true));
       expect(result.current.error).toBeDefined();
     });
   });
   ```

4. CI에서 테스트 자동 실행
   ```yaml
   # .github/workflows/ci.yml
   - run: npm test
   ```

**우선순위 테스트 대상:**
- `useManualDetail`
- `useManualDraft`
- `useConsultationSearch`
- `useSaveManual`
- `normalizeApiError`

**예상 소요:** 2주
**담당:** Frontend Team

---

## 4️⃣ 구조적 리팩토링 원칙 요약

신규 개발자 및 모든 팀원이 **반드시 지켜야 할 아키텍처 7대 원칙**:

---

### 원칙 1️⃣: 단일 HTTP 클라이언트 원칙

**규칙:**
```typescript
// ❌ 절대 금지
fetch('/api/v1/consultations');
axios.get('/api/v1/consultations');

// ✅ 항상 이렇게
import { api } from '@/lib/api/axiosClient';
api.get('/api/v1/consultations');
```

**이유:**
- 토큰 인터셉터, 에러 처리, 로깅 정책을 중앙에서 관리
- fetch 또는 별도 axios 인스턴스 사용 시 정책 우회 발생
- HTTP 클라이언트 변경 시 단일 파일만 수정

**예외:**
- 없음. 모든 HTTP 통신은 `axiosClient`를 통해야 함

---

### 원칙 2️⃣: 쿼리 키는 반드시 팩토리 패턴 사용

**규칙:**
```typescript
// ❌ 문자열 직접 사용 금지
useQuery({ queryKey: ['manuals', id], ... });

// ✅ 중앙 팩토리 사용
import { queryKeys } from '@/lib/queryKeys';
useQuery({ queryKey: queryKeys.manuals.detail(id), ... });
```

**이유:**
- 오타 방지 (IDE 자동완성)
- 타입 안전성 확보
- 리팩토링 시 변경 추적 용이 (문자열 검색 불필요)
- 계층 구조로 세밀한 무효화 가능

**예외:**
- 없음. 모든 쿼리 키는 `queryKeys` 팩토리를 통해 정의

---

### 원칙 3️⃣: Pages는 오케스트레이션만, 비즈니스 로직은 Hooks로

**규칙:**
```typescript
// ❌ 페이지에서 직접 API 호출/변환
const Page = () => {
  const [data, setData] = useState();
  useEffect(() => {
    fetch(...).then(res => setData(transform(res)));
  }, []);
};

// ✅ 훅으로 캡슐화
const Page = () => {
  const { data, isLoading, error } = useManualData(id);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={normalizeApiError(error)} />;

  return <ManualView data={data} />;
};
```

**이유:**
- 페이지는 **로딩/에러 분기**와 **렌더링**만 담당
- 비즈니스 로직은 재사용 가능한 **훅**으로
- 테스트 용이성 향상 (훅만 테스트하면 됨)

**허용되는 페이지 역할:**
- URL 파라미터 읽기 (`useParams`, `useSearchParams`)
- 로딩/에러 상태 분기
- View 컴포넌트 렌더링
- 간단한 네비게이션 (`navigate`)

---

### 원칙 4️⃣: location.state 금지, URL params 또는 서버 데이터 refetch 사용

**규칙:**
```typescript
// ❌ 새로고침 시 데이터 유실
navigate('/detail', { state: { data } });

// ✅ URL params + React Query 캐시
navigate(`/detail/${id}`);

const DetailPage = () => {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: queryKeys.detail(id!),
    queryFn: () => fetchDetail(id!),
  });
};
```

**이유:**
- 딥링크, 북마크, 새로고침 시에도 데이터 보장
- sessionStorage 사용 불필요 (메모리 관리 간소화)
- React Query 캐시 활용으로 불필요한 API 호출 최소화

**예외:**
- 일회성 알림 메시지 (`navigate('/success', { state: { message: '저장되었습니다' } })`)
- 단, 필수 데이터는 절대 location.state로 전달 금지

---

### 원칙 5️⃣: 에러는 통합 타입으로 정규화, UI 레이어는 AppError만 처리

**규칙:**
```typescript
// ❌ AxiosError, ApiResponseError 직접 처리 금지
catch (error: any) {
  if (error instanceof AxiosError) { ... }
  else if (error instanceof ApiResponseError) { ... }
}

// ✅ normalizeApiError로 통일
import { normalizeApiError } from '@/lib/api/errors';

catch (error) {
  const appError = normalizeApiError(error);
  showToast(getUserFriendlyMessage(appError), 'error');
}
```

**이유:**
- UI 레이어가 HTTP 라이브러리(Axios) 타입에 의존하지 않도록
- 에러 메시지 일관성 보장
- 에러 처리 로직 중복 제거

**구조:**
```
API Layer: AxiosError, ApiResponseError 발생
    ↓
normalizeApiError(): AppError로 변환
    ↓
UI Layer: AppError만 처리 (Toast, ErrorBoundary)
```

---

### 원칙 6️⃣: HEX 색상 하드코딩 절대 금지

**규칙:**
```typescript
// ❌ HEX 값 직접 사용
className="text-[#005BAC]"
style={{ color: '#005BAC' }}

// ✅ Tailwind 색상 이름
className="text-primary-500"
```

**이유:**
- 브랜드 색상 변경 시 `tailwind.config.js`만 수정
- 디자인 시스템 일관성 유지
- 린트 규칙으로 자동 검증 가능

**허용되는 색상:**
- `primary-*`: 광주은행 브랜드 색상
- `gray-*`: 텍스트 및 배경
- `red-*`, `green-*`, `yellow-*`, `blue-*`: 상태 색상

---

### 원칙 7️⃣: 훅은 단일 책임, 거대 훅은 분리

**규칙:**
```typescript
// ❌ 하나의 훅이 조회 + 상태 + 검증 + 저장
useManualEditForm() // 286줄

// ✅ 역할별 분리
useManualData()       // 조회 (React Query)
useManualFormState()  // 폼 상태 (useState)
useManualValidation() // 검증 로직
useSaveManual()       // 저장 (React Query mutation)
```

**이유:**
- 단일 책임 원칙(SRP) 준수
- 재사용성 증가 (조회만 필요한 경우 별도 사용 가능)
- 테스트 용이성 향상
- 코드 가독성 개선

**분리 기준:**
- 200줄 이상 → 분리 검토
- 여러 useEffect, useState, useMutation이 혼재 → 분리 필요
- 하나의 훅이 "조회 + 수정 + 삭제" 모두 포함 → 분리 필요

---

## 5️⃣ 실행 계획 및 다음 단계

### 즉시 실행 (이번 주)

1. **팀 회의 소집**
   - 이 보고서 공유 및 논의
   - P0 작업 우선순위 합의
   - 담당자 배정

2. **P0 Task 1 착수**
   - `lib/queryKeys.ts` 생성
   - 3개 주요 훅에 먼저 적용 (POC)
   - 나머지 훅으로 확대

### 단기 실행 (1~2주)

1. **P0 Task 2~4 병렬 진행**
   - Task 2 (API 일원화): 개발자 A
   - Task 3 (에러 타입): 개발자 B
   - Task 4 (location.state 제거): 개발자 C

2. **코드 리뷰 강화**
   - 7대 원칙 체크리스트 적용
   - PR 템플릿에 원칙 준수 여부 체크박스 추가

### 중기 실행 (1개월)

1. **P1 작업 순차 진행**
   - Task 5~7 우선
   - 주 1회 진행 상황 공유

2. **문서 업데이트**
   - `CLAUDE.md`에 7대 원칙 반영
   - `onboarding.md`에 리팩토링 가이드 추가

### 장기 실행 (2~3개월)

1. **P2 작업 점진적 적용**
   - 신규 기능 개발 시 자연스럽게 적용
   - 테스트 커버리지 목표: 핵심 훅 80% 이상

2. **아키텍처 회고**
   - 분기별 아키텍처 리뷰 세션
   - 개선 사항 도출 및 반영

---

## 📊 성공 지표

### P0 완료 시 (2주 후)
- [ ] 모든 쿼리 키가 `queryKeys` 팩토리 사용
- [ ] `fetch` 직접 사용 0건
- [ ] UI 레이어에서 `AxiosError` 직접 처리 0건
- [ ] `location.state`로 필수 데이터 전달 0건

### P1 완료 시 (1개월 후)
- [ ] 200줄 이상 훅 0개
- [ ] HEX 색상 하드코딩 0건
- [ ] API 응답 변환 로직이 `lib/api/transformers`에 중앙화

### P2 완료 시 (3개월 후)
- [ ] 핵심 훅 단위 테스트 커버리지 80% 이상
- [ ] CI에서 빌드/린트/테스트 자동 실행
- [ ] `components/ui` 라이브러리 구축

---

## 📞 문의 및 피드백

이 보고서에 대한 질문이나 피드백은 다음 채널로 연락 주세요:

- **Slack 채널**: #frontend-architecture
- **이메일**: frontend-team@example.com
- **정기 회의**: 매주 금요일 오후 3시 (아키텍처 리뷰 세션)

---

**문서 변경 이력:**

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2025-12-19 | 1.0 | 초안 작성 | Frontend Architecture Team |

---

**다음 리뷰 예정일:** 2026-01-19
**문서 소유자:** Frontend Architecture Team
**승인자:** CTO


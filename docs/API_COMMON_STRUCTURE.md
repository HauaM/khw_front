# API 공통 규격 구현 가이드

## 📌 개요

이 문서는 백엔드와의 API 공통 규격을 프론트엔드에서 구현한 구조를 설명합니다.

### 핵심 목표
- ✅ 일관된 API 응답 처리
- ✅ 자동 에러 처리 및 토스트 알림
- ✅ 피드백(feedback) 메시지 자동 표시
- ✅ 타입 안정성 보장
- ✅ React Query 통합

---

## 🏗️ 구현 구조

```
src/
├── types/
│   ├── api.ts                 # ✨ API 공통 규격 타입
│   └── index.ts              # 타입 barrel export
│
├── lib/api/
│   ├── axiosClient.ts         # 📦 Axios 인스턴스 (공통 규격 적용)
│   ├── responseHandler.ts     # 🛠️ 응답 처리 유틸리티
│   ├── index.ts              # API barrel export
│   ├── auth.ts               # 기존 API 레이어
│   ├── manuals.ts            # 기존 API 레이어
│   └── ... (기타 API)
│
└── hooks/
    ├── useApiQuery.ts         # 🚀 React Query + 공통 규격 (조회)
    ├── useApiMutation.ts      # 🚀 React Query + 공통 규격 (쓰기)
    ├── useFeedback.ts         # 📢 피드백 알림 처리
    ├── useApiError.ts         # ⚠️ 에러 처리 고급 기능
    ├── index.ts              # 훅 barrel export
    └── ... (기존 훅들)
```

---

## 📦 생성된 파일 상세 설명

### 1. `src/types/api.ts` - API 공통 규격 타입

**목적:** TypeScript 타입 안정성을 위한 API 공통 규격 정의

**제공 기능:**
- `ApiSuccessResponse<T>` - 성공 응답 타입
- `ApiErrorResponse` - 실패 응답 타입
- `ApiResponse<T>` - 성공 | 실패 통합 타입
- `ApiFeedback` - 피드백 메시지 타입
- `ApiMeta` - 메타데이터 (requestId, timestamp)
- `API_ERROR_CODES` - 에러 코드 상수
- `isApiSuccess()` - 성공 여부 타입 가드
- `isApiError()` - 실패 여부 타입 가드

**사용 예:**
```typescript
import { ApiResponse, isApiSuccess } from '@/types/api';

const response: ApiResponse<Manual> = await getManual(id);
if (isApiSuccess(response)) {
  console.log(response.data);  // Manual
}
```

### 2. `src/lib/api/responseHandler.ts` - 응답 처리 유틸리티

**목적:** API 응답을 파싱하고 에러를 처리하는 유틸리티 함수 모음

**제공 기능:**
- `extractApiSuccess<T>()` - 성공 응답에서 데이터 추출
- `extractApiWithFeedback<T>()` - 데이터 + 피드백 추출
- `apiErrorToError()` - API 에러를 JS Error로 변환
- `axiosErrorToApiError()` - Axios 에러를 API 에러로 변환
- `getUserFriendlyErrorMessage()` - 사용자 친화적 메시지 생성
- `groupFeedbacksByLevel()` - 피드백을 레벨별로 그룹화
- `ApiResponseError` - API 에러 커스텀 클래스

**사용 예:**
```typescript
import { extractApiSuccess } from '@/lib/api/responseHandler';

try {
  const data = extractApiSuccess(response);
  console.log(data);  // 응답 데이터
} catch (error) {
  console.log(error.message);  // 에러 메시지
}
```

### 3. `src/lib/api/axiosClient.ts` - 개선된 Axios 인터셉터

**변경사항:**
- ✅ API 공통 규격 에러 응답 자동 감지
- ✅ API 에러 코드로 토큰 만료 판단
- ✅ 에러 응답도 HTTP 200 상태로 올 수 있다는 가정 처리

**인터셉터 흐름:**
```
요청 → [토큰 추가] → 응답
       ↓
응답 → [성공 확인] → 데이터 반환
    ↓
    [실패 응답] → ApiResponseError throw
             ↓
          [재시도 가능?] → 토큰 갱신 → 재시도
             ↓
          [최종 에러] → Promise.reject
```

### 4. `src/hooks/useApiQuery.ts` - 조회용 통합 훅

**목적:** React Query + 공통 규격 + 자동 피드백/에러 처리

**핵심 기능:**
```typescript
const { data, isLoading, error } = useApiQuery(
  queryKey,           // React Query 키
  queryFn,           // API 호출 함수
  {
    autoShowFeedback: true,    // 피드백 자동 표시
    autoShowError: true,       // 에러 자동 표시
    successMessage: '완료!',   // 성공 메시지
    errorMessages: {},         // 에러별 커스텀 메시지
  }
);
```

**자동 처리:**
1. ✅ API 응답 파싱
2. ✅ 피드백 메시지 토스트 표시
3. ✅ 에러 발생 시 자동 토스트 표시
4. ✅ 성공 메시지 표시 (옵션)
5. ✅ 재시도 로직 (네트워크 에러는 3회)

### 5. `src/hooks/useApiMutation.ts` - 쓰기용 통합 훅

**목적:** React Query mutation + 공통 규격 + 자동 처리

**핵심 기능:**
```typescript
const { mutate, isPending, error } = useApiMutation(
  mutationFn,
  {
    successMessage: '저장되었습니다.',
    onSuccess: (data, feedbacks) => {
      // 성공 후 추가 처리
    },
    errorMessages: {
      'VALIDATION.ERROR': '입력값 오류',
    },
  }
);

mutate(variables);
```

**자동 처리:**
1. ✅ API 응답 파싱
2. ✅ 성공 메시지 표시
3. ✅ 피드백 메시지 표시
4. ✅ 에러 메시지 표시
5. ✅ 콜백 함수 실행 (onSuccess, onError)

### 6. `src/hooks/useFeedback.ts` - 피드백 알림 처리

**목적:** API 응답의 feedback 배열을 처리하여 토스트 알림으로 표시

**제공 메서드:**
```typescript
const {
  showFeedback,      // 단일 피드백 표시
  showFeedbacks,     // 여러 피드백 순차 표시
  showFeedbacksByLevel,  // 레벨별 필터링 후 표시
  showErrors,        // 에러 피드백만
  showWarnings,      // 경고 피드백만
  showInfos,         // 정보 피드백만
} = useFeedback();
```

**특징:**
- 각 레벨(info/warning/error)별 다른 지속 시간
- 여러 피드백을 순차적으로 표시
- 자동 표시 여부 제어 가능

### 7. `src/hooks/useApiError.ts` - 고급 에러 처리

**목적:** 에러 분석, 재시도 로직, 에러 상태 관리

**제공 기능:**
```typescript
const {
  error,               // 현재 에러 정보
  retryCount,          // 재시도 횟수

  handleError,         // 에러 처리
  clearError,          // 에러 초기화

  isAuthError,         // 인증 에러 확인
  isValidationError,   // 검증 에러 확인
  isServerError,       // 서버 에러 확인

  isRetryable,         // 재시도 가능 여부
  increaseRetry,       // 재시도 횟수 증가
  isMaxRetryReached,   // 최대 재시도 도달 확인
} = useApiError();
```

---

## 🔄 데이터 흐름

### 조회(Query) 흐름

```
┌─────────────────┐
│  Component      │
└────────┬────────┘
         │ useApiQuery(['key'], apiFunction)
         ↓
┌──────────────────────┐
│  useApiQuery         │
│  - React Query       │
│  - 응답 파싱        │
│  - 에러 처리        │
└─────────┬────────────┘
          │
          ↓ (성공)
┌──────────────────────┐
│  extractApiSuccess   │
│  - 데이터 추출      │
│  - 피드백 처리      │
└─────────┬────────────┘
          │
          ↓
┌──────────────────────┐
│  showFeedback()      │
│  - 토스트 알림      │
└──────────────────────┘

          (실패)
          ↓
┌──────────────────────┐
│  ApiResponseError    │
│  - 에러 분석        │
│  - 토스트 표시      │
└──────────────────────┘
```

### 쓰기(Mutation) 흐름

```
┌─────────────────┐
│  Component      │
│  mutate(data)   │
└────────┬────────┘
         │
         ↓
┌──────────────────────┐
│  useApiMutation      │
│  - React Query       │
│  - mutationFn 실행  │
└─────────┬────────────┘
          │
          ↓ (성공)
┌──────────────────────┐
│  1. 성공 토스트      │
│  2. 피드백 알림      │
│  3. onSuccess 콜백   │
└──────────────────────┘

          (실패)
          ↓
┌──────────────────────┐
│  1. 에러 토스트      │
│  2. 피드백 알림      │
│  3. onError 콜백     │
└──────────────────────┘
```

---

## 💻 사용 시작

### Step 1: API 레이어 작성

```typescript
// src/lib/api/manuals.ts
import { ApiResponse } from '@/types/api';
import { api } from './axiosClient';

export const getManuals = async () => {
  return api.get<ApiResponse<Manual[]>>('/api/v1/manuals');
};

export const createManual = async (data: ManualInput) => {
  return api.post<ApiResponse<Manual>>('/api/v1/manuals', data);
};
```

### Step 2: 컴포넌트에서 사용

```typescript
// src/pages/manuals/ManualListPage.tsx
import { useApiQuery } from '@/hooks/useApiQuery';
import { getManuals } from '@/lib/api/manuals';

const ManualListPage: React.FC = () => {
  const { data: manuals, isLoading, error } = useApiQuery(
    ['manuals'],
    getManuals,
    { autoShowError: true }
  );

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState />;

  return (
    <ul>
      {manuals.map((m) => (
        <li key={m.id}>{m.title}</li>
      ))}
    </ul>
  );
};
```

### Step 3: Mutation 사용

```typescript
import { useApiMutation } from '@/hooks/useApiMutation';
import { createManual } from '@/lib/api/manuals';

const CreateForm: React.FC = () => {
  const { mutate, isPending } = useApiMutation(createManual, {
    successMessage: '메뉴얼이 생성되었습니다.',
    onSuccess: () => {
      // 목록 새로고침
    },
  });

  return (
    <button onClick={() => mutate({ title: '제목' })} disabled={isPending}>
      생성
    </button>
  );
};
```

---

## 🎓 마이그레이션 가이드

### 기존 코드 (Before)

```typescript
// 기존 방식
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  api.get('/api/v1/manuals')
    .then(setData)
    .catch((err) => {
      setError(err);
      toast.error('오류: ' + err.message);
    })
    .finally(() => setIsLoading(false));
}, []);
```

### 새로운 코드 (After)

```typescript
// 새로운 방식 - 훨씬 간단!
const { data, isLoading, error } = useApiQuery(
  ['manuals'],
  getManuals,
  { autoShowError: true }
);
```

---

## 🚦 에러 처리 가이드

### 일반적인 에러 코드

| 에러 코드 | 의미 | 처리 방법 |
|----------|------|----------|
| `AUTH.INVALID_TOKEN` | 토큰 만료 | 자동 갱신 후 재시도 |
| `AUTH.FORBIDDEN` | 권한 없음 | 사용자 알림 |
| `VALIDATION.ERROR` | 입력값 오류 | 커스텀 메시지 표시 |
| `RESOURCE.NOT_FOUND` | 리소스 없음 | 돌아가기 또는 재시도 |
| `SERVER.ERROR` | 서버 오류 | 재시도 권유 |

### 에러 메시지 커스터마이징

```typescript
const { mutate } = useApiMutation(fn, {
  errorMessages: {
    'VALIDATION.ERROR': '입력값을 확인해주세요.',
    'RESOURCE.ALREADY_EXISTS': '이미 존재하는 항목입니다.',
    'RESOURCE.NOT_FOUND': '찾는 항목이 없습니다.',
    'AUTH.FORBIDDEN': '접근 권한이 없습니다.',
  },
});
```

---

## 📋 체크리스트

새로운 API 기능을 추가할 때:

- [ ] API 함수 작성 (`lib/api/`)에서 `ApiResponse<T>` 타입 명시
- [ ] `useApiQuery` 또는 `useApiMutation` 사용
- [ ] 에러 메시지 커스터마이징 설정
- [ ] 성공/실패 콜백 처리
- [ ] 토스트 알림 테스트
- [ ] 피드백 메시지 표시 테스트

---

## 🔗 관련 문서

- [API 공통 규격](./API_Common_Rule.me)
- [API 사용 가이드](./API_COMMON_USAGE.md)
- [프로젝트 가이드](./CLAUDE.md)


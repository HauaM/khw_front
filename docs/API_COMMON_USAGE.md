# API 공통 규격 사용 가이드

## 📋 개요

백엔드에서 정의한 API 공통 규격을 활용하여 일관되고 안전한 API 통신을 수행합니다.

### API 공통 규격

**성공 응답 (HTTP 200):**
```json
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "error": null,
  "meta": {
    "requestId": "1c0c...f",
    "timestamp": "2025-12-16T16:00:00+09:00"
  },
  "feedback": [
    {
      "code": "PROFILE_INCOMPLETE",
      "level": "info",
      "message": "프로필 사진을 등록하면 더 좋아요."
    }
  ]
}
```

**실패 응답 (HTTP 200 or 4xx/5xx):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH.INVALID_TOKEN",
    "message": "유효하지 않은 토큰입니다.",
    "details": { "reason": "expired" },
    "hint": "다시 로그인해 주세요."
  },
  "meta": {
    "requestId": "1c0c...f",
    "timestamp": "2025-12-16T16:00:00+09:00"
  },
  "feedback": []
}
```

---

## 🚀 빠른 시작

### 1. API 레이어에서 타입 선언

```typescript
// src/lib/api/manuals.ts
import { ApiResponse } from '@/types/api';

export const getManualDetail = async (id: string) => {
  const response = await api.get<ApiResponse<Manual>>(`/api/v1/manuals/${id}`);
  return response;
};

export const createManualDraft = async (data: ManualDraftInput) => {
  const response = await api.post<ApiResponse<ManualDraft>>('/api/v1/manuals/draft', data);
  return response;
};
```

### 2. 컴포넌트에서 useApiQuery 사용 (조회)

```typescript
import { useApiQuery } from '@/hooks/useApiQuery';
import { getManualDetail } from '@/lib/api/manuals';

const ManualDetailPage: React.FC<{ manualId: string }> = ({ manualId }) => {
  const { data, isLoading, error } = useApiQuery(
    ['manual', manualId],
    () => getManualDetail(manualId),
    {
      successMessage: '메뉴얼을 불러왔습니다.',
      autoShowError: true,
    }
  );

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState />;

  return <ManualDetailView manual={data} />;
};
```

### 3. 컴포넌트에서 useApiMutation 사용 (수정/삭제)

```typescript
import { useApiMutation } from '@/hooks/useApiMutation';
import { createManualDraft } from '@/lib/api/manuals';

const CreateManualForm: React.FC = () => {
  const { mutate, isPending } = useApiMutation(
    (data: ManualDraftInput) => createManualDraft(data),
    {
      successMessage: '메뉴얼 초안이 저장되었습니다.',
      onSuccess: (data, feedbacks) => {
        // 성공 후 처리
        console.log('생성된 메뉴얼:', data);
        console.log('피드백:', feedbacks);
      },
      errorMessages: {
        'VALIDATION.ERROR': '입력값이 올바르지 않습니다.',
        'RESOURCE.ALREADY_EXISTS': '같은 제목의 메뉴얼이 이미 존재합니다.',
      },
    }
  );

  const handleSubmit = (formData: ManualDraftInput) => {
    mutate(formData);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(/* form data */);
    }}>
      {/* 폼 필드들 */}
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

---

## 📦 제공되는 기능

### 1. 타입 정의 (`src/types/api.ts`)

```typescript
// API 응답 타입
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 타입 가드
isApiSuccess(response);  // ✅ true/false
isApiError(response);    // ❌ true/false

// 에러 코드 상수
API_ERROR_CODES.AUTH_INVALID_TOKEN
API_ERROR_CODES.VALIDATION_ERROR
API_ERROR_CODES.RESOURCE_NOT_FOUND
// ... 등
```

### 2. 응답 처리 유틸리티 (`src/lib/api/responseHandler.ts`)

```typescript
// 데이터 추출 (에러면 throw)
const data = extractApiSuccess(response);

// 데이터 + 피드백 추출
const { data, feedback, meta } = extractApiWithFeedback(response);

// 타입 가드
if (isSuccess(response)) {
  console.log(response.data); // T
}

// 에러 변환
const error = apiErrorToError(errorResponse);
const apiError = axiosErrorToApiError(axiosError);

// 사용자 메시지 생성
const message = getUserFriendlyErrorMessage(error);

// 피드백 그룹화
const grouped = groupFeedbacksByLevel(feedbacks);
```

### 3. React Query 통합 훅

#### useApiQuery (조회)

```typescript
const { data, isLoading, error, refetch } = useApiQuery(
  queryKey,
  queryFn,
  {
    // React Query 옵션
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,

    // 공통 규격 옵션
    autoShowFeedback: true,    // 피드백 자동 표시
    autoShowError: true,       // 에러 자동 표시
    successMessage: '완료!',   // 성공 메시지
    errorMessages: {           // 에러별 커스텀 메시지
      'AUTH.FORBIDDEN': '접근 권한이 없습니다.',
    },
  }
);
```

#### useApiMutation (생성/수정/삭제)

```typescript
const { mutate, isPending, isError, error } = useApiMutation(
  (variables) => api.post('/api/v1/...', variables),
  {
    successMessage: '저장되었습니다.',
    autoShowFeedback: true,
    onSuccess: (data, feedbacks) => {
      // 성공 후 추가 처리
      queryClient.invalidateQueries(['list']);
    },
    onError: (error) => {
      // 에러 추가 처리
    },
  }
);

// 호출
mutate(variables);
```

### 4. 피드백 처리 훅 (`src/hooks/useFeedback.ts`)

```typescript
const { showFeedback, showFeedbacks, showErrors, showWarnings } = useFeedback({
  autoShow: true,
  duration: {
    info: 3000,
    warning: 4000,
    error: 5000,
  },
});

// 사용
showFeedback(feedback);        // 단일 표시
showFeedbacks(feedbacks);      // 여러 개 표시
showErrors(feedbacks);         // 에러만
showWarnings(feedbacks);       // 경고만
```

### 5. 에러 처리 훅 (`src/hooks/useApiError.ts`)

```typescript
const {
  error,
  retryCount,
  hasError,

  // 메서드
  handleError,
  clearError,

  // 타입 확인
  isAuthError,
  isValidationError,
  isServerError,

  // 재시도
  isRetryable,
  increaseRetry,
  isMaxRetryReached,
} = useApiError({
  autoShow: true,
  errorMessages: {
    'AUTH.INVALID_TOKEN': '토큰이 만료되었습니다.',
  },
});

// 사용
try {
  await api.post('/api/v1/...');
} catch (err) {
  handleError(err);

  if (error.isRetryable()) {
    increaseRetry();
    // 재시도 로직
  }
}
```

---

## 💡 실무 예제

### 예제 1: 목록 조회 + 상세 조회

```typescript
// src/pages/manuals/ManualDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getManualDetail } from '@/lib/api/manuals';

const ManualDetailPage: React.FC = () => {
  const { manualId } = useParams<{ manualId: string }>();

  const { data: manual, isLoading, error } = useApiQuery(
    ['manual', manualId],
    () => getManualDetail(manualId!),
    {
      enabled: !!manualId,
      successMessage: '메뉴얼을 불러왔습니다.',
      autoShowError: true,
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} />;

  return <ManualDetailView manual={manual} />;
};
```

### 예제 2: 폼 제출 + 피드백 처리

```typescript
// src/components/manuals/CreateManualForm.tsx
import { useApiMutation } from '@/hooks/useApiMutation';
import { createManualDraft } from '@/lib/api/manuals';
import { useNavigate } from 'react-router-dom';

interface CreateManualFormProps {
  onSuccess?: (id: string) => void;
}

const CreateManualForm: React.FC<CreateManualFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ManualDraftInput>({
    title: '',
    keywords: [],
    background: '',
    guidelines: [],
  });

  const { mutate: createDraft, isPending } = useApiMutation(
    (data) => createManualDraft(data),
    {
      successMessage: '메뉴얼 초안이 저장되었습니다.',
      autoShowFeedback: true,
      autoShowError: true,
      errorMessages: {
        'VALIDATION.ERROR': '필수 정보를 입력하세요.',
        'RESOURCE.ALREADY_EXISTS': '이미 존재하는 제목입니다.',
      },
      onSuccess: (data, feedbacks) => {
        console.log('피드백:', feedbacks);
        if (onSuccess) {
          onSuccess(data.id);
        } else {
          navigate(`/manuals/drafts/${data.id}`);
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDraft(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="메뉴얼 제목"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

### 예제 3: 재시도 로직

```typescript
// src/components/common/RetryableAction.tsx
import { useApiError } from '@/hooks/useApiError';

interface RetryableActionProps {
  action: () => Promise<void>;
  children: (state: { isLoading: boolean; error: Error | null }) => React.ReactNode;
}

const RetryableAction: React.FC<RetryableActionProps> = ({ action, children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError, increaseRetry, isMaxRetryReached } = useApiError();

  const handleRetry = async () => {
    if (isMaxRetryReached(3)) {
      alert('최대 재시도 횟수에 도달했습니다.');
      return;
    }

    clearError();
    setIsLoading(true);

    try {
      await action();
    } catch (err) {
      handleError(err as any);
      increaseRetry();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {children({ isLoading, error: error as any })}
      {error && (
        <button onClick={handleRetry} disabled={isLoading}>
          재시도
        </button>
      )}
    </>
  );
};
```

---

## 🎯 베스트 프랙티스

### ✅ DO (권장)

1. **항상 타입을 명시**
```typescript
const { data } = useApiQuery<Manual>(
  ['manual', id],
  () => getManualDetail(id),
);
```

2. **에러 메시지 커스터마이징**
```typescript
errorMessages: {
  'VALIDATION.ERROR': '입력값이 올바르지 않습니다.',
  'RESOURCE.NOT_FOUND': '찾는 메뉴얼이 없습니다.',
}
```

3. **피드백과 에러를 분리하여 처리**
```typescript
const { mutate } = useApiMutation(fn, {
  autoShowFeedback: true,  // 피드백 자동
  autoShowError: true,     // 에러 자동
});
```

4. **조건부 쿼리 활성화**
```typescript
const { data } = useApiQuery(key, fn, {
  enabled: !!userId,  // userId가 있을 때만 요청
});
```

### ❌ DON'T (비권장)

1. **Axios 직접 사용**
```typescript
// ❌ 하지 말 것
const response = await axiosClient.post('/api/v1/...');
```

2. **매번 try-catch 작성**
```typescript
// ❌ 하지 말 것 (useApiMutation이 처리함)
try {
  const result = await mutate(data);
} catch (e) {
  // ...
}
```

3. **메시지를 하드코딩**
```typescript
// ❌ 하지 말 것
toast.error('오류 발생!');

// ✅ 옳게
errorMessages: {
  'API_ERROR_CODE': '사용자 친화적 메시지',
}
```

---

## 🐛 디버깅 팁

### 1. API 응답 확인

```typescript
// 네트워크 탭에서 응답 확인
// → success: true/false
// → error.code: 에러 코드
// → feedback: 피드백 배열
```

### 2. 콘솔에서 에러 확인

```typescript
if (error instanceof ApiResponseError) {
  console.log('에러 코드:', error.code);
  console.log('에러 메시지:', error.message);
  console.log('요청 ID:', error.requestId);
  console.log('상세:', error.details);
}
```

### 3. 토스트 알림 순서

```
1. 에러 메시지 (즉시)
2. 피드백 메시지 (0.5초 후 순차)
3. 성공 메시지 (1초 후)
```

---

## 📚 관련 문서

- [API 공통 규격](./API_Common_Rule.me)
- [프로젝트 가이드](./CLAUDE.md)
- [스타일 가이드](./UI_UX_STYLE_GUIDE.md)


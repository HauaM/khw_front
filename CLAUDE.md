# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🎯 프로젝트 개요

**프로젝트명:** KWH 지식관리시스템 (광주은행)
**설명:** 광주은행 헬프데스크 위키 지식관리시스템의 프론트엔드
**총 코드 라인:** ~3,200줄
**최종 업데이트:** 2025-12-12

### 주요 기능
- 상담 조회 및 검색
- 메뉴얼(가이드) 생성, 수정, 검색
- 메뉴얼 검토 워크플로우
- 공통코드(카테고리) 관리
- 메뉴얼 버전 비교

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | React 18 |
| **언어** | TypeScript 5.3 |
| **빌드 도구** | Vite 5.0 |
| **라우팅** | React Router 6.21 |
| **스타일링** | Tailwind CSS 3.4 (표준화 완료) |
| **상태관리** | React Query 5.17 (서버 상태) |
| **HTTP 클라이언트** | Axios 1.6 |
| **아이콘** | Heroicons React 2.2 |
| **스타일 라이브러리** | styled-components 6.1 (최소화 사용) |

---

## 📦 개발 환경 설정

### 필수 요구사항
```bash
Node.js 18+ (권장: 20+)
npm 9+ 또는 yarn 3+
```

### 설치 및 실행

```bash
# 의존성 설치
npm install
# 또는
yarn install

# 환경 변수 설정 (.env.example 참조)
cp .env.example .env

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크 및 린트 (빌드 시 자동 실행)
npm run lint

# 프리뷰
npm run preview
```

### 개발 서버 접속
```
http://localhost:3000
```

---

## 📁 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 컴포넌트
│   ├── common/             # 공통 컴포넌트 (Spinner, Toast, Pagination, Icons)
│   ├── auth/               # 인증 관련
│   ├── consultations/      # 상담 관련 컴포넌트
│   ├── manuals/            # 메뉴얼 관련 컴포넌트
│   ├── reviews/            # 검토 관련 컴포넌트
│   ├── search/             # 검색 컴포넌트
│   ├── modals/             # 모달 컴포넌트
│   ├── table/              # 테이블 컴포넌트
│   └── commonCode/         # 공통코드 관리 컴포넌트
│
├── pages/                  # 페이지 레벨 컴포넌트
│   ├── auth/              # 로그인, 회원가입
│   ├── consultations/      # 상담 조회, 검색
│   ├── manuals/            # 메뉴얼 관련 페이지 (7개 파일)
│   ├── reviews/            # 검토 작업 페이지
│   ├── admin/              # 관리자 페이지
│   ├── dashboard/          # 대시보드
│   └── HomePage.tsx
│
├── routes/
│   └── AppRouter.tsx       # React Router 설정
│
├── layouts/                # 레이아웃 컴포넌트
│   ├── AppLayout.tsx
│   ├── AppHeader.tsx
│   └── AppSidebar.tsx
│
├── lib/
│   ├── api/               # API 레이어
│   │   ├── axiosClient.ts      # Axios 설정 & 토큰 인터셉터
│   │   ├── auth.ts             # 인증 API
│   │   ├── consultations.ts    # 상담 API
│   │   ├── manuals.ts          # 메뉴얼 API
│   │   ├── manualReviewTasks.ts # 검토 API
│   │   └── commonCodes.ts      # 공통코드 API
│   └── queryClient.ts     # React Query 설정
│
├── hooks/                 # 커스텀 훅 (17개)
│   ├── useManualDraft.ts
│   ├── useManualEditForm.ts
│   ├── useManualReviewTasks.ts
│   ├── useCommonCodeManagement.ts
│   └── ... (기타 훅들)
│
├── types/                 # TypeScript 타입 정의
│   ├── manuals.ts
│   ├── consultations.ts
│   ├── reviews.ts
│   ├── auth.ts
│   └── commonCode.ts
│
├── contexts/              # React Context
│   └── ToastContext.tsx
│
├── utils/                 # 유틸리티 함수
│   └── ... (필요시 추가)
│
├── styles/
│   └── globals.css        # 전역 스타일 (Tailwind directives & 커스텀 클래스)
│
├── App.tsx
└── main.tsx
```

---

## 🏗️ 아키텍처 주요 패턴

### 1. API 계층 (`lib/api/`)

**패턴:** 함수 기반 API 래퍼

```typescript
// 예: manuals.ts
export const getManualDraftList = async (params?: any) => {
  const response = await api.get('/api/v1/manuals/draft', { params });
  return response.data;
};
```

**특징:**
- Axios 인스턴스를 사용한 중앙 집중식 HTTP 관리
- 요청/응답 인터셉터로 토큰 자동 갱신
- 모든 API는 `lib/api/*.ts` 파일에 정의
- 타입 안전성을 위해 request/response 타입 정의

### 2. 커스텀 훅 패턴 (`hooks/`)

**패턴:** React Query + 로직 캡슐화

```typescript
// 예: useManualEditForm.ts
export const useManualEditForm = (manualId: string) => {
  const [formData, setFormData] = useState<ManualForm | null>(null);
  const mutation = useMutation({
    mutationFn: (data) => saveManualDraft(data),
    onSuccess: () => { /* 성공 로직 */ }
  });

  return { formData, mutation, /* ... */ };
};
```

**특징:**
- API 호출 로직을 훅으로 캡슐화
- React Query의 `useQuery`, `useMutation` 활용
- 컴포넌트에서는 로직 없이 표시만 담당

### 3. 페이지 구조 패턴

```typescript
// 파일: src/pages/manuals/ManualDetailPage.tsx
const ManualDetailPage: React.FC = () => {
  const { manualId } = useParams();
  const { data, isLoading, error } = useManualDetail(manualId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState />;

  return <ManualDetailView detail={data} />;
};
```

**특징:**
- 로딩/에러 상태 처리
- View 컴포넌트로 렌더링 분리
- 대부분의 페이지가 이 구조 따름

### 4. 라우팅 (`routes/AppRouter.tsx`)

```typescript
// React Router v6 설정
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/consultations/search', element: <ConsultationSearchPage /> },
  { path: '/manuals/drafts', element: <ManualDraftListPage /> },
  // ... 모든 라우트
];
```

---

## 🎨 스타일링 표준 (2025-12-12 표준화 완료)

### ✅ 현재 표준: Tailwind CSS 100%

**중요:** 모든 스타일링은 Tailwind CSS만 사용합니다.

#### 색상 팔레트 (`tailwind.config.js`)

```javascript
// Primary 색상 (광주은행 브랜드)
primary-500: '#005BAC'   // 메인 색상
primary-600: '#00437F'   // 호버/선택 색상

// Gray 색상
gray-900: '#111827'      // 제목/기본 텍스트
gray-600: '#4b5563'      // 보조 텍스트
gray-50: '#f9fafb'       // 배경

// Status 색상
green-600 / error / warning / info
```

#### 올바른 사용법 ✅

```tsx
// 버튼
<button className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg">
  저장
</button>

// 텍스트
<p className="text-gray-900">제목</p>
<p className="text-gray-600">보조 텍스트</p>

// 카드
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  내용
</div>

// 에러 상태
<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
  오류 메시지
</div>
```

#### 금지된 사용법 ❌

```tsx
// HEX 색상 하드코딩
className="bg-[#005BAC]"        // ❌ 하지 말 것

// 인라인 스타일
style={{ color: '#005BAC' }}    // ❌ 하지 말 것

// styled-components
import styled from 'styled-components'  // ❌ 최소화

// CSS 파일
import './style.css'            // ❌ 하지 말 것
```

#### 추가 참고 자료

- **상세 가이드**: `docs/UI_UX_STYLE_GUIDE.md`
- **색상 참조**: `docs/TAILWIND_COLOR_REFERENCE.md`
- **체크리스트**: `docs/STYLE_STANDARDIZATION_CHECKLIST.md`

---

## 🔄 주요 개발 패턴

### 신규 페이지 작성

```typescript
// 1. pages/에 파일 생성
// 2. 라우트 추가 (routes/AppRouter.tsx)
// 3. 필요한 API 함수 작성 (lib/api/)
// 4. 커스텀 훅 작성 (hooks/)
// 5. 페이지 컴포넌트 작성

const NewPage: React.FC = () => {
  const { data, isLoading } = useNewFeature();

  if (isLoading) return <Spinner />;

  return <NewPageView data={data} />;
};
```

### 신규 API 엔드포인트 추가

```typescript
// lib/api/새기능.ts
export const fetchNewData = async (id: string) => {
  const response = await api.get(`/api/v1/path/${id}`);
  return response.data as NewDataType;
};

// hooks/useNewFeature.ts
export const useNewFeature = (id: string) => {
  return useQuery({
    queryKey: ['newFeature', id],
    queryFn: () => fetchNewData(id),
  });
};
```

### 컴포넌트 작성

```typescript
// Tailwind CSS만 사용
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
      >
        작업
      </button>
    </div>
  );
};
```

---

## 🔗 주요 API 패턴

### 상담 관련
- `GET /api/v1/consultations/search` - 상담 검색
- `GET /api/v1/consultations/{id}` - 상담 상세 조회

### 메뉴얼 관련
- `POST /api/v1/manuals/draft` - 메뉴얼 초안 생성
- `GET /api/v1/manuals/draft/{id}` - 초안 조회
- `PUT /api/v1/manuals/{id}` - 메뉴얼 수정
- `GET /api/v1/manuals/search` - 메뉴얼 검색
- `POST /api/v1/manual-review/tasks/{id}/approve` - 검토 승인

### 공통코드 관련
- `GET /api/v1/common-codes` - 공통코드 목록 조회

**자세한 API 문서:** `docs/openapi.json`

---

## ⚠️ 주의사항

### 타입 안전성
- **strict: true** 설정 활성화
- 모든 컴포넌트는 React.FC<Props> 패턴 사용
- 반드시 필요한 props는 선택사항으로 표시하지 않기

### 성능
- 불필요한 리렌더링 피하기 (useCallback, useMemo 활용)
- 대용량 리스트는 가상화 고려
- API 응답은 React Query로 캐싱

### 오류 처리
- API 오류는 `try-catch` 또는 React Query의 `onError` 콜백 사용
- 사용자에게 Toast 또는 ErrorBoundary로 오류 안내

### 환경 변수
- `.env`에 민감한 정보 저장 (예: API 키)
- `import.meta.env.VITE_*` 형식으로 접근
- Git에 `.env` 파일 커밋 금지

---

## 🚀 자주 사용하는 명령어

```bash
# 개발
npm run dev              # 개발 서버 실행

# 빌드 및 검증
npm run build            # 프로덕션 빌드 (타입 체크 + Vite 빌드)
npm run lint             # ESLint 검사

# 프리뷰
npm run preview          # 빌드된 결과 미리보기

# 린팅
npm run lint -- --fix    # 자동 수정 (ESLint)
```

---

## 📝 린팅 및 포맷팅

### ESLint 설정 (`.eslintrc.cjs`)
- TypeScript 규칙 적용
- React hooks 규칙 체크
- 미사용 변수/파라미터 검사 (strict mode)

### 주의사항
- 빌드 시 `--max-warnings 0` 설정으로 모든 경고를 오류처럼 처리
- 린팅 오류는 반드시 수정 필요
- Git commit 전 `npm run lint`로 검사

---

## 🔐 인증 및 토큰 관리

### 토큰 플로우
1. 로그인 시 access token 발급
2. Axios 인터셉터가 모든 요청에 token 자동 추가
3. 401 에러 시 자동으로 token 갱신
4. 토큰 갱신 실패 시 로그인 페이지로 리다이렉트

### 구현 위치
- **인터셉터:** `lib/api/axiosClient.ts`
- **인증 훅:** `hooks/useAuthUser.ts`
- **인증 API:** `lib/api/auth.ts`

---

## 📊 프로젝트 상태

### ✅ 완료된 작업
- Tailwind CSS 표준화 (2025-12-12)
- styled-components 제거 (ManualDraftListPage)
- 색상 하드코딩 제거
- 스타일 가이드 문서 작성

### 🔄 진행 중
- 일부 TypeScript 타입 오류 (기존 이슈)
- 관리자 페이지 기능 구현

### ⏳ 향후 계획
- 임시 페이지 스타일링 (기능 구현 시 함께 진행)
- 다크모드 지원 검토
- 접근성(A11y) 개선

---

## 💡 팁 및 베스트 프랙티스

### 1. 페이지 작성 시 체크리스트
```
[ ] Tailwind CSS만 사용했는가?
[ ] 색상은 primary-500 등 이름으로 참조했는가?
[ ] 로딩/에러 상태를 처리했는가?
[ ] API는 lib/api/에서 불러왔는가?
[ ] 커스텀 훅을 사용했는가?
[ ] TypeScript 타입을 정의했는가?
```

### 2. 색상 사용
- **메인 액션:** `bg-primary-500`
- **호버 상태:** `hover:bg-primary-600`
- **텍스트:** `text-gray-900` (제목), `text-gray-600` (보조)
- **배경:** `bg-gray-50`, `bg-gray-100`
- **에러:** `bg-red-50 text-red-600`
- **성공:** `bg-green-50 text-green-600`

### 3. 컴포넌트 재사용
- Toast 알림: `useToast()` 훅 사용
- 로딩 스피너: `<Spinner />` 컴포넌트
- 페이지네이션: `<Pagination />` 컴포넌트

### 4. 디버깅
```bash
# VSCode에서 Tailwind IntelliSense 플러그인 설치
# Command Palette: "Tailwind CSS: Clear Cache"

# 브라우저 개발자 도구
# Computed styles에서 실제 적용된 CSS 확인
```

---

## 📚 관련 문서

| 문서 | 목적 |
|------|------|
| [UI_UX_STYLE_GUIDE.md](docs/UI_UX_STYLE_GUIDE.md) | 스타일링 표준 및 컴포넌트 가이드 |
| [TAILWIND_COLOR_REFERENCE.md](docs/TAILWIND_COLOR_REFERENCE.md) | 색상 팔레트 및 사용 패턴 |
| [STYLE_STANDARDIZATION_CHECKLIST.md](docs/STYLE_STANDARDIZATION_CHECKLIST.md) | 표준화 작업 체크리스트 |
| [openapi.json](docs/openapi.json) | API 명세 (OpenAPI 3.0) |
| [README.md](README.md) | 프로젝트 기본 정보 |

---

## 🆘 문제 해결

### 스타일이 적용되지 않는 경우
1. Tailwind 클래스 이름이 정확한지 확인
2. 브라우저 캐시 삭제 (개발 서버 재시작)
3. `tailwind.config.js` 수정 후 서버 재시작

### 빌드 실패
1. TypeScript 오류 확인: `npm run lint`
2. 의존성 재설치: `npm install`
3. 캐시 삭제: `rm -rf node_modules dist`

### 색상이 이상하게 나오는 경우
1. 색상이 설정파일에 정의되어 있는지 확인
2. HEX값을 직접 입력하지 않았는지 확인
3. Tailwind 문서에서 색상 이름 확인

---

**최종 업데이트:** 2025-12-12
**담당자:** Frontend Team
**버전:** 1.0

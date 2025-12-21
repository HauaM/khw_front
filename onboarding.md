# 🚀 KWH 지식관리시스템 온보딩 가이드

> 광주은행 헬프데스크 위키 지식관리시스템 프론트엔드 개발자 온보딩 문서

**최종 업데이트:** 2025-12-19
**버전:** 1.0
**대상:** 신규 개발자, 협업 개발자

---

## 📋 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [시작하기](#-시작하기)
3. [프로젝트 구조](#-프로젝트-구조)
4. [핵심 개념](#-핵심-개념)
5. [개발 워크플로우](#-개발-워크플로우)
6. [스타일링 가이드](#-스타일링-가이드)
7. [API 통신](#-api-통신)
8. [상태 관리](#-상태-관리)
9. [라우팅](#-라우팅)
10. [컴포넌트 패턴](#-컴포넌트-패턴)
11. [테스트 및 디버깅](#-테스트-및-디버깅)
12. [트러블슈팅](#-트러블슈팅)
13. [추가 리소스](#-추가-리소스)

---

## 🎯 프로젝트 소개

### 개요
광주은행 헬프데스크 팀을 위한 지식관리 시스템의 프론트엔드입니다. 상담 내용을 메뉴얼로 전환하고, 검토/승인 워크플로우를 통해 지식 데이터베이스를 구축합니다.

### 주요 기능
- **상담 관리**: 상담 조회, 검색, 상세 보기
- **메뉴얼 관리**: 초안 생성, 수정, 검색, 버전 비교
- **검토 워크플로우**: 메뉴얼 검토 요청/승인/반려
- **공통코드 관리**: 카테고리 및 코드 관리
- **대시보드**: 통계 및 현황 조회

### 기술 스택 요약
```
프레임워크: React 18.2
언어: TypeScript 5.3
빌드: Vite 5.0
라우팅: React Router 6.21
스타일: Tailwind CSS 3.4 (100%)
상태관리: React Query 5.17
HTTP: Axios 1.6
아이콘: Heroicons 2.2
```

---

## 🏁 시작하기

### 1️⃣ 사전 준비

#### 필수 도구 설치
```bash
# Node.js 18+ (권장: 20 LTS)
node --version  # v20.x.x 이상

# npm 또는 yarn
npm --version   # 9.x.x 이상
# 또는
yarn --version  # 3.x.x 이상
```

#### 권장 VSCode 확장
- **ESLint**: 코드 품질 검사
- **Tailwind CSS IntelliSense**: Tailwind 자동완성
- **TypeScript Vue Plugin (Volar)**: TS 지원 강화
- **Prettier**: 코드 포맷팅 (선택사항)

### 2️⃣ 프로젝트 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd khw_front

# 2. 의존성 설치
npm install
# 또는
yarn install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API 엔드포인트 등 설정

# 4. 개발 서버 실행
npm run dev
# http://localhost:3000 에서 확인
```

### 3️⃣ 첫 번째 빌드

```bash
# TypeScript 검사 + 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 검사
npm run lint
```

**중요:** 빌드 성공 여부를 반드시 확인하세요. 경고도 오류로 처리됩니다 (`--max-warnings 0`).

### 4️⃣ 백엔드 연동 확인

```bash
# .env 파일 예시
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=KWH 지식관리시스템
```

개발 서버 실행 후 로그인 페이지(`/auth/login`)에서 인증 테스트를 진행하세요.

---

## 📁 프로젝트 구조

### 디렉토리 트리 (핵심 요약)

```
khw_front/
├── src/
│   ├── main.tsx                 # 앱 진입점
│   ├── App.tsx                  # 최상위 컴포넌트 (QueryClient, Router 래핑)
│   │
│   ├── routes/
│   │   └── AppRouter.tsx        # React Router 라우트 정의
│   │
│   ├── pages/                   # 페이지 컴포넌트 (18개)
│   │   ├── auth/                # 로그인, 회원가입
│   │   ├── consultations/       # 상담 관련 (3개)
│   │   ├── manuals/             # 메뉴얼 관련 (7개)
│   │   ├── reviews/             # 검토 관련 (3개)
│   │   ├── admin/               # 관리자 페이지 (3개)
│   │   └── dashboard/           # 대시보드
│   │
│   ├── components/              # 재사용 컴포넌트
│   │   ├── common/              # Spinner, Toast, Pagination, Modal, Icons
│   │   ├── consultations/       # 상담 관련 컴포넌트
│   │   ├── manuals/             # 메뉴얼 관련 컴포넌트
│   │   ├── reviews/             # 검토 관련 컴포넌트
│   │   ├── search/              # 검색 폼
│   │   ├── table/               # 테이블 컴포넌트
│   │   ├── modals/              # 모달 컴포넌트
│   │   └── commonCode/          # 공통코드 관리 컴포넌트
│   │
│   ├── layouts/                 # 레이아웃 컴포넌트
│   │   ├── AppLayout.tsx        # 메인 레이아웃 (Header + Sidebar + Content)
│   │   ├── AppHeader.tsx        # 상단 헤더
│   │   └── AppSidebar.tsx       # 사이드바 네비게이션
│   │
│   ├── hooks/                   # 커스텀 훅 (23개)
│   │   ├── useAuthUser.ts       # 사용자 인증 상태
│   │   ├── useManualDraft.ts    # 메뉴얼 초안 조회
│   │   ├── useToast.ts          # Toast 알림
│   │   └── ... (기타 비즈니스 로직 훅)
│   │
│   ├── lib/
│   │   ├── api/                 # API 레이어
│   │   │   ├── axiosClient.ts   # Axios 인스턴스 (토큰 인터셉터)
│   │   │   ├── auth.ts          # 인증 API
│   │   │   ├── consultations.ts # 상담 API
│   │   │   ├── manuals.ts       # 메뉴얼 API
│   │   │   ├── manualReviewTasks.ts # 검토 API
│   │   │   └── commonCodes.ts   # 공통코드 API
│   │   ├── queryClient.ts       # React Query 설정
│   │   └── utils/
│   │       └── dateFormatter.ts # 날짜 포맷팅
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── auth.ts
│   │   ├── consultations.ts
│   │   ├── manuals.ts
│   │   ├── reviews.ts
│   │   └── api.ts
│   │
│   ├── contexts/
│   │   └── ToastContext.tsx     # Toast 알림 Context
│   │
│   └── styles/
│       └── globals.css          # 전역 CSS (Tailwind directives)
│
├── docs/                        # 문서
│   ├── openapi.json             # API 명세
│   ├── UI_UX_STYLE_GUIDE.md     # 스타일 가이드
│   └── TAILWIND_COLOR_REFERENCE.md
│
├── CLAUDE.md                    # Claude Code 가이드
├── README.md                    # 프로젝트 소개
└── package.json                 # 의존성 및 스크립트
```

### 파일 수 요약
- **페이지**: 18개
- **컴포넌트**: 40+ 개
- **커스텀 훅**: 23개
- **API 파일**: 6개
- **총 코드 라인**: ~3,200줄

---

## 💡 핵심 개념

### 1. 아키텍처 패턴

이 프로젝트는 **레이어드 아키텍처**를 따릅니다:

```
┌─────────────────────────────────┐
│   Pages (페이지 컴포넌트)         │  ← 라우트와 1:1 매핑
└─────────────────────────────────┘
           ↓ 사용
┌─────────────────────────────────┐
│   Custom Hooks (비즈니스 로직)    │  ← React Query + API 호출
└─────────────────────────────────┘
           ↓ 사용
┌─────────────────────────────────┐
│   API Layer (lib/api)            │  ← Axios 기반 HTTP 통신
└─────────────────────────────────┘
           ↓ 호출
┌─────────────────────────────────┐
│   Backend REST API               │
└─────────────────────────────────┘
```

### 2. 단방향 데이터 흐름

```
사용자 액션 → 페이지 → 훅 (mutation) → API → 서버
                ↑                              ↓
                └──────── 응답 (query) ─────────┘
```

### 3. 컴포넌트 철학

- **Pages**: 라우트 레벨, 로딩/에러 처리, View 렌더링
- **Components**: UI 로직만 담당, props로 데이터 수신
- **Hooks**: 비즈니스 로직 캡슐화, 재사용성 극대화

---

## 🛠️ 개발 워크플로우

### 신규 기능 개발 5단계

#### 1️⃣ 타입 정의 (`types/`)

```typescript
// types/myFeature.ts
export interface MyFeatureData {
  id: string;
  name: string;
  createdAt: string;
}

export interface MyFeatureRequest {
  name: string;
}
```

#### 2️⃣ API 함수 작성 (`lib/api/`)

```typescript
// lib/api/myFeature.ts
import api from './axiosClient';
import { MyFeatureData, MyFeatureRequest } from '@/types/myFeature';

export const fetchMyFeature = async (id: string): Promise<MyFeatureData> => {
  const response = await api.get(`/api/v1/my-feature/${id}`);
  return response.data;
};

export const createMyFeature = async (data: MyFeatureRequest): Promise<MyFeatureData> => {
  const response = await api.post('/api/v1/my-feature', data);
  return response.data;
};
```

#### 3️⃣ 커스텀 훅 작성 (`hooks/`)

```typescript
// hooks/useMyFeature.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMyFeature, createMyFeature } from '@/lib/api/myFeature';
import { useToast } from './useToast';

export const useMyFeature = (id: string) => {
  return useQuery({
    queryKey: ['myFeature', id],
    queryFn: () => fetchMyFeature(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};

export const useCreateMyFeature = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: createMyFeature,
    onSuccess: () => {
      showToast('생성되었습니다', 'success');
    },
    onError: (error) => {
      showToast('생성에 실패했습니다', 'error');
    },
  });
};
```

#### 4️⃣ 페이지 컴포넌트 작성 (`pages/`)

```typescript
// pages/myFeature/MyFeaturePage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMyFeature } from '@/hooks/useMyFeature';
import Spinner from '@/components/common/Spinner';
import MyFeatureView from '@/components/myFeature/MyFeatureView';

const MyFeaturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useMyFeature(id!);

  if (isLoading) return <Spinner />;
  if (error) return <div className="text-red-600">오류가 발생했습니다</div>;
  if (!data) return <div className="text-gray-600">데이터가 없습니다</div>;

  return <MyFeatureView data={data} />;
};

export default MyFeaturePage;
```

#### 5️⃣ 라우트 등록 (`routes/AppRouter.tsx`)

```typescript
// routes/AppRouter.tsx
import MyFeaturePage from '@/pages/myFeature/MyFeaturePage';

const routes = [
  // ... 기존 라우트
  { path: '/my-feature/:id', element: <MyFeaturePage /> },
];
```

### 체크리스트

신규 기능 개발 시 다음을 확인하세요:

- [ ] TypeScript 타입 정의 완료
- [ ] API 함수 작성 및 타입 지정
- [ ] 커스텀 훅으로 로직 캡슐화
- [ ] 로딩/에러 상태 처리
- [ ] Tailwind CSS만 사용 (HEX 하드코딩 금지)
- [ ] Toast 알림 구현 (성공/실패)
- [ ] React Query 캐싱 전략 고려
- [ ] 린트 오류 없음 (`npm run lint`)
- [ ] 빌드 성공 확인 (`npm run build`)

---

## 🎨 스타일링 가이드

### ⚠️ 중요: Tailwind CSS 100% 사용

**절대 금지:**
- HEX 색상 하드코딩 (`bg-[#005BAC]`)
- 인라인 스타일 (`style={{ color: '#005BAC' }}`)
- styled-components (최소화 예정)
- 별도 CSS 파일

### 색상 팔레트

```typescript
// Primary (광주은행 브랜드)
primary-500   // #005BAC - 메인 색상
primary-600   // #00437F - 호버/선택

// Gray (텍스트 및 배경)
gray-900      // #111827 - 제목
gray-600      // #4b5563 - 보조 텍스트
gray-100      // #f3f4f6 - 배경
gray-50       // #f9fafb - 밝은 배경

// Status
green-600     // 성공
red-600       // 에러
yellow-600    // 경고
blue-600      // 정보
```

### 올바른 사용 예시 ✅

```tsx
// 버튼
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
  저장
</button>

// 카드
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  <h2 className="text-lg font-bold text-gray-900 mb-2">제목</h2>
  <p className="text-gray-600">내용</p>
</div>

// 에러 메시지
<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
  오류가 발생했습니다
</div>

// 성공 알림
<div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded">
  저장되었습니다
</div>
```

### 잘못된 사용 예시 ❌

```tsx
// 하드코딩된 HEX 값
<button className="bg-[#005BAC]">...</button>  // ❌

// 인라인 스타일
<div style={{ color: '#005BAC' }}>...</div>    // ❌

// styled-components
const StyledButton = styled.button`...`;       // ❌ (레거시만 허용)
```

### 자주 사용하는 패턴

| 용도 | 클래스 |
|------|--------|
| 메인 버튼 | `bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg` |
| 보조 버튼 | `bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg` |
| 제목 텍스트 | `text-lg font-bold text-gray-900` |
| 본문 텍스트 | `text-sm text-gray-600` |
| 카드 컨테이너 | `bg-white rounded-lg shadow-sm border border-gray-100 p-6` |
| 입력 필드 | `border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500` |

---

## 🌐 API 통신

### Axios 설정 (`lib/api/axiosClient.ts`)

#### 특징
- **Base URL**: 환경변수 `VITE_API_BASE_URL`에서 읽음
- **토큰 자동 관리**: 요청 시 자동으로 `Authorization: Bearer {token}` 헤더 추가
- **자동 갱신**: 401 에러 시 토큰 갱신 시도
- **에러 처리**: 토큰 갱신 실패 시 자동 로그아웃

#### 사용법

```typescript
// 1. API 함수 정의 (lib/api/consultations.ts 예시)
import api from './axiosClient';

export const searchConsultations = async (params: ConsultationSearchParams) => {
  const response = await api.get('/api/v1/consultations/search', { params });
  return response.data;
};

// 2. 커스텀 훅에서 호출 (hooks/useConsultationSearch.ts)
import { useQuery } from '@tanstack/react-query';
import { searchConsultations } from '@/lib/api/consultations';

export const useConsultationSearch = (params: ConsultationSearchParams) => {
  return useQuery({
    queryKey: ['consultations', 'search', params],
    queryFn: () => searchConsultations(params),
    enabled: !!params.keyword, // 검색어가 있을 때만 실행
  });
};
```

### API 응답 타입 정의

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// types/consultations.ts
export interface Consultation {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// lib/api/consultations.ts
export const getConsultation = async (id: string): Promise<Consultation> => {
  const response = await api.get<Consultation>(`/api/v1/consultations/${id}`);
  return response.data;
};
```

### 인터셉터 동작 원리

```
요청 전
└─> 토큰 존재? → 헤더에 추가

응답 후
├─> 200 OK → 정상 반환
├─> 401 Unauthorized → 토큰 갱신 시도
│   ├─> 갱신 성공 → 원래 요청 재시도
│   └─> 갱신 실패 → 로그아웃 & /auth/login 리다이렉트
└─> 기타 에러 → 에러 반환
```

---

## 📊 상태 관리

### React Query (TanStack Query 5)

#### 설정 (`lib/queryClient.ts`)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
      retry: 1,                     // 실패 시 1회 재시도
      staleTime: 5 * 60 * 1000,     // 5분간 fresh 상태 유지
    },
  },
});
```

#### 쿼리 (데이터 조회)

```typescript
// hooks/useManualDetail.ts
import { useQuery } from '@tanstack/react-query';

export const useManualDetail = (manualId: string) => {
  return useQuery({
    queryKey: ['manuals', manualId],        // 캐시 키
    queryFn: () => getManualDetail(manualId), // API 호출 함수
    enabled: !!manualId,                    // manualId가 있을 때만 실행
    staleTime: 10 * 60 * 1000,              // 10분간 캐시 유지
  });
};

// 사용 예시
const { data, isLoading, error, refetch } = useManualDetail('123');
```

#### 뮤테이션 (데이터 변경)

```typescript
// hooks/useSaveManualDraft.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSaveManualDraft = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: saveManualDraft,
    onSuccess: (data) => {
      // 캐시 무효화 (리스트 재조회)
      queryClient.invalidateQueries({ queryKey: ['manuals', 'drafts'] });
      showToast('저장되었습니다', 'success');
    },
    onError: (error) => {
      showToast('저장에 실패했습니다', 'error');
    },
  });
};

// 사용 예시
const { mutate, isPending } = useSaveManualDraft();
mutate({ id: '123', content: '...' });
```

#### 쿼리 키 네이밍 컨벤션

```typescript
['manuals']                           // 메뉴얼 전체
['manuals', 'drafts']                 // 메뉴얼 초안 목록
['manuals', 'drafts', draftId]        // 특정 초안
['manuals', manualId]                 // 특정 메뉴얼
['consultations', 'search', params]   // 상담 검색 결과
['reviews', 'tasks']                  // 검토 작업 목록
```

### Context API (전역 상태)

#### Toast 알림 (`contexts/ToastContext.tsx`)

```typescript
// 사용법
import { useToast } from '@/hooks/useToast';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleSave = () => {
    showToast('저장되었습니다', 'success');
  };

  return <button onClick={handleSave}>저장</button>;
};
```

**Toast 타입:**
- `success`: 성공 (녹색)
- `error`: 에러 (빨간색)
- `warning`: 경고 (노란색)
- `info`: 정보 (파란색)

---

## 🧭 라우팅

### React Router 6 구조 (`routes/AppRouter.tsx`)

#### 주요 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 홈 (대시보드로 리다이렉트) |
| `/auth/login` | LoginPage | 로그인 |
| `/auth/register` | RegisterPage | 회원가입 |
| `/dashboard` | DashboardPage | 대시보드 |
| `/consultations/search` | ConsultationSearchPage | 상담 검색 |
| `/consultations/:id` | ConsultationDetailPage | 상담 상세 |
| `/consultations/create` | ConsultationCreatePage | 상담 생성 |
| `/manuals/search` | ManualSearchPage | 메뉴얼 검색 |
| `/manuals/:id` | ManualDetailPage | 메뉴얼 상세 |
| `/manuals/:id/edit` | ManualEditPage | 메뉴얼 수정 |
| `/manuals/drafts` | ManualDraftListPage | 초안 목록 |
| `/manuals/draft/:id` | ManualDraftResultPage | 초안 상세 |
| `/manuals/approved` | ApprovedManualCardsPage | 승인된 메뉴얼 |
| `/manuals/:id/history` | ManualHistoryPage | 메뉴얼 히스토리 |
| `/manuals/:id/version-compare` | ManualVersionComparePage | 버전 비교 |
| `/reviews/tasks` | ReviewTaskListPage | 검토 작업 목록 |
| `/reviews/tasks/:taskId` | ManualReviewTaskDetailPage | 검토 작업 상세 |
| `/reviews/:reviewId` | ManualReviewDetailPage | 검토 상세 |
| `/admin/users` | AdminUsersPage | 사용자 관리 |
| `/admin/common-codes` | CommonCodeManagementPage | 공통코드 관리 |
| `/admin/settings` | AdminSettingsPage | 시스템 설정 |

#### 프로그래매틱 네비게이션

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 1. 기본 이동
    navigate('/manuals/search');

    // 2. 파라미터와 함께 이동
    navigate(`/manuals/${manualId}`);

    // 3. state 전달 (location.state로 접근 가능)
    navigate('/manuals/draft/result', {
      state: { draftData: data }
    });

    // 4. 뒤로 가기
    navigate(-1);
  };

  return <button onClick={handleClick}>이동</button>;
};
```

#### 파라미터 및 쿼리스트링

```typescript
import { useParams, useSearchParams, useLocation } from 'react-router-dom';

const MyPage = () => {
  // URL 파라미터 (/manuals/:id)
  const { id } = useParams<{ id: string }>();

  // 쿼리스트링 (?page=1&size=10)
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';

  // location.state (navigate 시 전달한 데이터)
  const location = useLocation();
  const stateData = location.state;

  return <div>Manual ID: {id}, Page: {page}</div>;
};
```

---

## 🧩 컴포넌트 패턴

### 페이지 컴포넌트 패턴

```typescript
// pages/example/ExamplePage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useExampleData } from '@/hooks/useExampleData';
import Spinner from '@/components/common/Spinner';
import ExampleView from '@/components/example/ExampleView';

const ExamplePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useExampleData(id!);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg m-4">
        오류가 발생했습니다: {error.message}
      </div>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <div className="text-gray-600 p-4">
        데이터가 없습니다
      </div>
    );
  }

  // 정상 렌더링
  return <ExampleView data={data} />;
};

export default ExamplePage;
```

### View 컴포넌트 패턴 (Presentational)

```typescript
// components/example/ExampleView.tsx
import React from 'react';
import { ExampleData } from '@/types/example';

interface ExampleViewProps {
  data: ExampleData;
  onAction?: (id: string) => void;
}

const ExampleView: React.FC<ExampleViewProps> = ({ data, onAction }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <p className="text-gray-600 mb-6">{data.description}</p>

      {onAction && (
        <button
          onClick={() => onAction(data.id)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          작업 실행
        </button>
      )}
    </div>
  );
};

export default ExampleView;
```

### 폼 컴포넌트 패턴

```typescript
// components/example/ExampleForm.tsx
import React, { useState } from 'react';
import { ExampleFormData } from '@/types/example';

interface ExampleFormProps {
  initialData?: ExampleFormData;
  onSubmit: (data: ExampleFormData) => void;
  onCancel?: () => void;
}

const ExampleForm: React.FC<ExampleFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ExampleFormData>(
    initialData || { title: '', description: '' }
  );

  const handleChange = (field: keyof ExampleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default ExampleForm;
```

### 공통 컴포넌트 활용

#### Spinner

```typescript
import Spinner from '@/components/common/Spinner';

<Spinner />  // 기본 크기
```

#### Toast

```typescript
import { useToast } from '@/hooks/useToast';

const { showToast } = useToast();
showToast('메시지', 'success' | 'error' | 'warning' | 'info');
```

#### Pagination

```typescript
import Pagination from '@/components/common/Pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

#### Modal

```typescript
import Modal from '@/components/common/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="제목">
  <p>모달 내용</p>
</Modal>
```

---

## 🧪 테스트 및 디버깅

### 린트 검사

```bash
# 전체 검사
npm run lint

# 자동 수정 (가능한 경우)
npm run lint -- --fix
```

**주의:** 빌드 시 모든 경고가 오류로 처리됩니다 (`--max-warnings 0`).

### TypeScript 타입 검사

```bash
# TypeScript 컴파일 검사 (빌드 없이)
npx tsc --noEmit
```

### 빌드 검증

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### React Query Devtools (개발 모드)

프로젝트에 React Query Devtools가 설정되어 있다면, 개발 서버 실행 시 브라우저 우측 하단에 아이콘이 표시됩니다. 클릭하면:

- 활성 쿼리 목록
- 캐시 상태
- 쿼리 재실행/무효화

를 확인할 수 있습니다.

### 브라우저 디버깅

#### 1. React Developer Tools
- Components 탭: 컴포넌트 트리 및 props 확인
- Profiler 탭: 렌더링 성능 분석

#### 2. Network 탭
- API 요청/응답 확인
- 토큰 헤더 확인
- 응답 시간 측정

#### 3. Console 팁

```typescript
// API 호출 디버깅 (axiosClient.ts에 추가)
api.interceptors.request.use(config => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(response => {
  console.log('[API Response]', response.config.url, response.data);
  return response;
});
```

---

## 🔧 트러블슈팅

### 자주 발생하는 문제

#### 1. Tailwind 스타일이 적용되지 않음

**증상:** 클래스를 추가했는데 스타일이 보이지 않음

**해결:**
```bash
# 개발 서버 재시작
npm run dev

# 브라우저 캐시 삭제 (Ctrl + Shift + R)

# Tailwind 설정 확인
# tailwind.config.js의 content 배열에 파일 경로가 포함되어 있는지 확인
```

#### 2. 401 Unauthorized 에러

**증상:** API 호출 시 계속 401 에러 발생

**해결:**
```typescript
// 1. 토큰 확인
console.log(localStorage.getItem('token'));

// 2. 토큰 갱신
// axiosClient.ts의 인터셉터가 자동으로 처리하지만,
// 실패 시 로그인 페이지로 리다이렉트됨

// 3. 로그인 다시 시도
navigate('/auth/login');
```

#### 3. React Query 캐시 문제

**증상:** 데이터를 수정했는데 화면에 반영되지 않음

**해결:**
```typescript
// 1. 캐시 무효화
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['manuals'] });

// 2. 수동 재조회
const { refetch } = useManualDetail(id);
refetch();

// 3. mutation의 onSuccess에서 자동 무효화
useMutation({
  mutationFn: saveManual,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['manuals', manualId] });
  },
});
```

#### 4. 빌드 실패

**증상:** `npm run build` 실패

**해결:**
```bash
# 1. TypeScript 오류 확인
npx tsc --noEmit

# 2. 린트 오류 확인
npm run lint

# 3. 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 4. 캐시 삭제
rm -rf dist .vite
```

#### 5. 환경변수가 undefined

**증상:** `import.meta.env.VITE_API_BASE_URL`이 undefined

**해결:**
```bash
# 1. .env 파일 존재 확인
ls -la .env

# 2. 변수명이 VITE_ 로 시작하는지 확인
cat .env

# 3. 개발 서버 재시작 (환경변수 변경 시 필수)
npm run dev
```

#### 6. HMR (Hot Module Replacement) 작동 안 함

**증상:** 코드 수정 후 브라우저가 자동으로 새로고침되지 않음

**해결:**
```bash
# 1. Vite 서버 재시작
npm run dev

# 2. 포트 충돌 확인
# vite.config.ts에서 다른 포트로 변경
server: { port: 3001 }

# 3. 파일 감시 제한 확인 (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📚 추가 리소스

### 필수 문서

| 문서 | 내용 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | Claude Code 가이드 (AI 개발 보조) |
| [README.md](README.md) | 프로젝트 기본 정보 |
| [docs/UI_UX_STYLE_GUIDE.md](docs/UI_UX_STYLE_GUIDE.md) | 스타일링 표준 및 컴포넌트 가이드 |
| [docs/TAILWIND_COLOR_REFERENCE.md](docs/TAILWIND_COLOR_REFERENCE.md) | 색상 팔레트 상세 |
| [docs/openapi.json](docs/openapi.json) | 백엔드 API 명세 (OpenAPI 3.0) |

### 외부 참고 자료

#### 공식 문서
- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Vite 공식 문서](https://vitejs.dev/)
- [React Router 공식 문서](https://reactrouter.com/)
- [TanStack Query (React Query) 공식 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Axios 공식 문서](https://axios-http.com/docs/intro)

#### 학습 자료
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [React Query 튜토리얼](https://tanstack.com/query/latest/docs/react/quick-start)

### VSCode 단축키 (권장)

| 단축키 | 기능 |
|--------|------|
| `Ctrl + P` | 파일 빠른 열기 |
| `Ctrl + Shift + F` | 전체 검색 |
| `F2` | 심볼 리네임 (변수/함수명 일괄 변경) |
| `Ctrl + Shift + P` | 명령 팔레트 |
| `Ctrl + B` | 사이드바 토글 |
| `Ctrl + \`` | 터미널 토글 |
| `Alt + ↑/↓` | 줄 이동 |
| `Ctrl + /` | 주석 토글 |

---

## 🎓 학습 경로 (신규 개발자)

### 1주차: 환경 설정 및 기본 이해
- [ ] 개발 환경 설정 완료
- [ ] 프로젝트 구조 파악
- [ ] 로컬에서 빌드 및 실행 성공
- [ ] CLAUDE.md, README.md 정독
- [ ] Tailwind CSS 기본 학습

### 2주차: 코드 탐색 및 패턴 이해
- [ ] 주요 페이지 컴포넌트 3개 분석
- [ ] API 레이어 (`lib/api/`) 동작 방식 이해
- [ ] React Query 사용 패턴 파악
- [ ] 커스텀 훅 5개 분석

### 3주차: 간단한 기능 수정
- [ ] 기존 페이지에 작은 UI 수정
- [ ] Toast 알림 추가
- [ ] 버튼 클릭 핸들러 작성
- [ ] Tailwind 클래스로 스타일 변경

### 4주차: 신규 기능 개발
- [ ] 새로운 API 엔드포인트 연동
- [ ] 커스텀 훅 작성
- [ ] 페이지 컴포넌트 작성
- [ ] 라우트 추가

### 5주차 이후: 독립 개발
- [ ] 복잡한 기능 구현
- [ ] 컴포넌트 리팩토링
- [ ] 성능 최적화
- [ ] 코드 리뷰 참여

---

## 🤝 협업 가이드

### Git 워크플로우

```bash
# 1. 최신 코드 받기
git checkout main
git pull origin main

# 2. 기능 브랜치 생성
git checkout -b feature/my-new-feature

# 3. 작업 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 4. 푸시
git push origin feature/my-new-feature

# 5. Pull Request 생성
# GitHub에서 PR 생성 및 코드 리뷰 요청
```

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 스타일 변경 (기능 변경 없음)
docs: 문서 수정
chore: 빌드/설정 변경
test: 테스트 코드 추가/수정
```

### 코드 리뷰 체크리스트

리뷰어는 다음을 확인합니다:

- [ ] TypeScript 타입이 명확한가?
- [ ] Tailwind CSS만 사용했는가?
- [ ] 로딩/에러 상태를 처리했는가?
- [ ] API 호출은 커스텀 훅으로 캡슐화했는가?
- [ ] 린트 오류가 없는가?
- [ ] 빌드가 성공하는가?
- [ ] 불필요한 console.log가 없는가?

---

## 📞 문의 및 지원

### 질문이 있을 때

1. **문서 확인**: 이 온보딩 문서, CLAUDE.md, README.md
2. **코드 검색**: 비슷한 기능이 이미 구현되어 있을 수 있음
3. **팀 채널**: Slack/Teams 등 팀 채널에 질문
4. **코드 리뷰**: PR에 질문 코멘트 남기기

### 일반적인 질문

**Q: 어떤 컴포넌트를 수정해야 하나요?**
A: `src/pages/` 에서 해당 페이지를 찾고, 관련 컴포넌트는 `src/components/` 에서 확인하세요.

**Q: API가 연동되지 않아요**
A: `.env` 파일의 `VITE_API_BASE_URL`을 확인하고, 개발 서버를 재시작하세요.

**Q: 색상을 어떻게 변경하나요?**
A: `tailwind.config.js`에 정의된 색상만 사용하세요. HEX 값 하드코딩은 금지입니다.

**Q: 새로운 페이지를 어떻게 추가하나요?**
A: [개발 워크플로우](#-개발-워크플로우) 섹션의 5단계 가이드를 따르세요.

---

## ✅ 온보딩 완료 체크리스트

다음을 모두 완료했다면 온보딩이 완료된 것입니다!

### 환경 설정
- [ ] Node.js 18+ 설치 확인
- [ ] 프로젝트 클론 및 의존성 설치
- [ ] `.env` 파일 설정
- [ ] 개발 서버 실행 성공 (`npm run dev`)
- [ ] 프로덕션 빌드 성공 (`npm run build`)

### 문서 이해
- [ ] 이 온보딩 문서 완독
- [ ] CLAUDE.md 읽음
- [ ] README.md 읽음
- [ ] 프로젝트 구조 파악

### 코드 탐색
- [ ] `src/routes/AppRouter.tsx` 확인
- [ ] 주요 페이지 컴포넌트 3개 이상 분석
- [ ] API 레이어 (`lib/api/`) 동작 방식 이해
- [ ] 커스텀 훅 사용법 파악

### 실습
- [ ] 기존 컴포넌트에 작은 수정 적용
- [ ] Toast 알림 사용해보기
- [ ] React Query로 데이터 조회해보기
- [ ] Tailwind CSS로 스타일링해보기

### 도구
- [ ] VSCode 확장 설치 (ESLint, Tailwind IntelliSense)
- [ ] React Developer Tools 설치
- [ ] Git 설정 완료

---

**축하합니다! 🎉**

온보딩을 완료했습니다. 이제 KWH 지식관리시스템 개발에 기여할 준비가 되었습니다.

궁금한 점이 있으면 언제든 팀에 문의하세요. 행운을 빕니다! 🚀

---

**문서 버전:** 1.0
**작성일:** 2025-12-19
**다음 리뷰 예정일:** 2026-01-19

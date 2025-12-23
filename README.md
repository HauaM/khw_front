# KWH 지식관리시스템 - 광주은행

광주은행 헬프데스크 위키 지식관리시스템 프론트엔드

> 📝 **최종 업데이트**: 2025-12-23
> 📦 **버전**: 0.0.1
> 📊 **총 코드**: ~17,900 라인

## 기술 스택

- **React 18.2** - UI 라이브러리
- **TypeScript 5.3** - 타입 안전성
- **Vite 5.0** - 빌드 도구
- **React Router 6.21** - 라우팅
- **Tailwind CSS 3.4** - 스타일링 (100% 표준화 완료)
- **React Query 5.17** - 서버 상태 관리
- **Axios 1.6** - HTTP 클라이언트
- **Heroicons 2.2** - 아이콘

## 시작하기

### 필수 요구사항

- Node.js 18+
- Yarn 또는 npm

### 설치

```bash
# Yarn 사용
yarn install

# 또는 npm 사용
npm install
```

### 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 개발 서버 실행

```bash
# Yarn 사용
yarn dev

# 또는 npm 사용
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
# Yarn 사용
yarn build

# 또는 npm 사용
npm run build
```

### 프리뷰

```bash
# Yarn 사용
yarn preview

# 또는 npm 사용
npm run preview
```

## 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 컴포넌트 (51개)
│   ├── common/             # 공통 컴포넌트 (Spinner, Toast, Pagination, Modal 등)
│   ├── auth/               # 인증 관련 컴포넌트
│   ├── consultations/      # 상담 관련 컴포넌트
│   ├── manuals/            # 메뉴얼 관련 컴포넌트
│   ├── reviews/            # 검토 관련 컴포넌트
│   ├── admin/              # 관리자 컴포넌트
│   ├── departments/        # 부서 관리 컴포넌트
│   ├── commonCode/         # 공통코드 관리 컴포넌트
│   ├── modals/             # 모달 컴포넌트
│   ├── search/             # 검색 컴포넌트
│   └── table/              # 테이블 컴포넌트
│
├── layouts/                # 레이아웃 컴포넌트
│   ├── AppLayout.tsx
│   ├── AppHeader.tsx
│   └── AppSidebar.tsx
│
├── pages/                  # 페이지 컴포넌트 (23개)
│   ├── auth/              # 로그인, 회원가입
│   ├── consultations/      # 상담 관련 페이지
│   ├── manuals/            # 메뉴얼 관련 페이지
│   ├── reviews/            # 검토 관련 페이지
│   ├── admin/              # 관리자 페이지
│   └── dashboard/          # 대시보드
│
├── routes/                 # 라우팅 설정
│   └── AppRouter.tsx
│
├── lib/                    # 라이브러리 설정
│   ├── api/               # API 레이어 (9개)
│   │   ├── axiosClient.ts      # Axios 인스턴스 + 인터셉터
│   │   ├── auth.ts             # 인증 API
│   │   ├── consultations.ts    # 상담 API
│   │   ├── manuals.ts          # 메뉴얼 API
│   │   ├── manualReviewTasks.ts # 검토 API
│   │   ├── commonCodes.ts      # 공통코드 API
│   │   ├── departments.ts      # 부서 API
│   │   ├── users.ts            # 사용자 API
│   │   └── responseHandler.ts  # 응답 처리 유틸
│   ├── queryClient.ts     # React Query 설정
│   └── utils/             # 유틸리티 함수
│
├── hooks/                  # 커스텀 훅 (30개)
│   ├── useAuthUser.ts
│   ├── useManualDraft.ts
│   ├── useDepartments.ts
│   ├── useUsers.ts
│   └── ...
│
├── types/                  # TypeScript 타입 정의 (8개)
│   ├── auth.ts
│   ├── consultations.ts
│   ├── manuals.ts
│   ├── reviews.ts
│   ├── departments.ts
│   ├── users.ts
│   └── api.ts
│
├── contexts/               # React Context
│   └── ToastContext.tsx
│
├── styles/                 # 전역 스타일
│   └── globals.css
│
├── App.tsx
└── main.tsx
```

### 프로젝트 규모
- **페이지**: 23개
- **컴포넌트**: 51개
- **커스텀 훅**: 30개
- **API 파일**: 9개
- **총 코드 라인**: ~17,900줄

## 주요 기능

### 1. 상담 관리
- 상담 검색 및 조회
- 상담 상세 보기
- 상담 생성
- 유사 상담 비교 및 분석

### 2. 메뉴얼 관리
- 메뉴얼 초안 생성 및 관리
- 메뉴얼 검색
- 메뉴얼 수정
- 버전 비교
- 히스토리 관리
- 승인된 메뉴얼 카드 보기

### 3. 검토 워크플로우
- 검토 작업 목록 조회
- 메뉴얼 검토 요청
- 검토 승인/반려
- 검토 작업 상세 보기

### 4. 관리자 기능
- **사용자 관리**: 사용자 등록, 수정, 역할 관리
- **부서 관리**: 부서 생성, 수정, 삭제, 조회
- **공통코드 관리**: 카테고리 및 코드 관리 (그룹/아이템)
- **시스템 설정**: 시스템 설정 관리

### 5. 대시보드
- 통계 및 현황 조회
- 주요 지표 시각화

## 기술적 특징

### 레이아웃 시스템
- **헤더**: 시스템 타이틀, 사용자 정보, 로그아웃
- **사이드바**: 계층형 메뉴 네비게이션
- **메인 영역**: 라우팅된 페이지 콘텐츠

### 공통 컴포넌트
- **Spinner**: 로딩 인디케이터
- **Toast**: 알림 메시지 시스템
- **Pagination**: 페이지네이션
- **Modal**: 모달 다이얼로그
- **ConfirmDialog**: 확인 다이얼로그
- **TypeAheadSelectBox**: 자동완성 선택 박스 (키보드 네비게이션 지원)

### API 통신
- Axios 클라이언트 설정
- 인터셉터를 통한 토큰 자동 관리
- 토큰 갱신 로직
- 에러 응답 통합 처리

## 개발 가이드

### 컴포넌트 작성

```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
    </div>
  );
};

export default MyComponent;
```

### API 호출 예시

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axiosClient';

const fetchData = async () => {
  return api.get('/endpoint');
};

const MyComponent = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isLoading) return <Spinner />;

  return <div>{/* 데이터 렌더링 */}</div>;
};
```

## 스타일링 가이드

### ⚠️ 중요: Tailwind CSS 100% 사용

**모든 스타일링은 Tailwind CSS만 사용합니다.**

### 브랜드 컬러

```javascript
// Primary (광주은행 브랜드)
primary-500: '#005BAC'   // 메인 색상
primary-600: '#00437F'   // 호버/선택 색상

// Status
success: '#10b981'       // 성공
warning: '#f59e0b'       // 경고
error: '#ef4444'         // 에러
info: '#3b82f6'          // 정보
```

### 금지 사항 ❌
- HEX 색상 하드코딩 (`bg-[#005BAC]`)
- 인라인 스타일 (`style={{ color: '#005BAC' }}`)
- styled-components (최소화)
- 별도 CSS 파일

### 상세 가이드
- `docs/UI_UX_STYLE_GUIDE.md` - 스타일링 표준
- `docs/TAILWIND_COLOR_REFERENCE.md` - 색상 팔레트

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev         # 또는 yarn dev

# 프로덕션 빌드
npm run build       # TypeScript 체크 + Vite 빌드

# 린트 검사
npm run lint        # ESLint 검사 (--max-warnings 0)

# 빌드 미리보기
npm run preview     # 빌드 결과 확인
```

## 최근 업데이트

### 2025-12-23
- ✅ 부서 관리 화면 구현
- ✅ TypeAheadSelectBox 키보드 네비게이션 추가
- ✅ 메뉴얼 초안 조회 버그 수정
- ✅ 상담 생성 기능 완료
- ✅ API 명세 최신화 (openapi.json)

### 2025-12-12
- ✅ Tailwind CSS 표준화 완료
- ✅ styled-components 제거
- ✅ 색상 하드코딩 제거
- ✅ 스타일 가이드 문서 작성

## 추가 문서

| 문서 | 설명 |
|------|------|
| [onboarding.md](onboarding.md) | 신규 개발자 온보딩 가이드 (완전판) |
| [CLAUDE.md](CLAUDE.md) | Claude Code AI 개발 가이드 |
| [docs/UI_UX_STYLE_GUIDE.md](docs/UI_UX_STYLE_GUIDE.md) | UI/UX 스타일 가이드 |
| [docs/openapi.json](docs/openapi.json) | API 명세 (OpenAPI 3.0) |

## 라이선스

Copyright © 2024-2025 광주은행. All rights reserved.

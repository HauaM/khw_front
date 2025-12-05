# KWH 지식관리시스템 - 광주은행

광주은행 헬프데스크 위키 지식관리시스템 프론트엔드

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Tailwind CSS** - 스타일링
- **React Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트

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
├── components/        # 재사용 가능한 컴포넌트
│   └── common/       # 공통 컴포넌트 (Pagination, Toast, Spinner)
├── layouts/          # 레이아웃 컴포넌트
│   ├── AppLayout.tsx
│   ├── AppHeader.tsx
│   └── AppSidebar.tsx
├── pages/            # 페이지 컴포넌트
├── routes/           # 라우팅 설정
│   └── AppRouter.tsx
├── lib/              # 외부 라이브러리 설정
│   ├── api/
│   │   └── axiosClient.ts
│   └── queryClient.ts
├── hooks/            # 커스텀 훅
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── styles/           # 전역 스타일
│   └── globals.css
├── App.tsx
└── main.tsx
```

## 주요 기능

### 레이아웃

- **헤더**: 시스템 타이틀, 사용자 정보, 로그아웃
- **사이드바**: 메뉴 네비게이션
- **메인 영역**: 라우팅된 페이지 콘텐츠

### 공통 컴포넌트

- **Pagination**: 페이지네이션
- **Toast**: 알림 메시지
- **Spinner**: 로딩 인디케이터

### API 통신

- Axios 클라이언트 설정
- 인터셉터를 통한 토큰 관리
- 자동 토큰 갱신

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

## 브랜드 컬러

- **Primary Blue**: `#0066e6` (광주은행 메인 컬러)
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

## 라이선스

Copyright © 2024 광주은행. All rights reserved.

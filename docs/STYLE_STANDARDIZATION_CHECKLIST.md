# ✅ 스타일 표준화 작업 체크리스트

**프로젝트:** KWH 지식관리시스템
**목표:** Tailwind CSS 표준화 (100% 달성)
**시작일:** 2025-12-12
**예상 완료일:** 2025-12-19

---

## 📊 전체 진행률

```
총 작업 항목: 13개
완료: 0개 (0%)
진행 중: 0개 (0%)
대기: 13개 (100%)

진행상황:
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
```

---

## 🚀 1단계: 색상 체계 표준화 (필수 & 긴급)

**예상 소요 시간:** 30분
**담당자:**
**상태:** ⏳ 대기 중

### 1.1 tailwind.config.js 수정

**파일:** `tailwind.config.js`
**목표:** 실제 사용 색상으로 primary 색상 팔레트 업데이트

#### 변경 전 상태

```javascript
// 현재 상태
colors: {
  primary: {
    50: '#e6f0ff',
    100: '#b3d4ff',
    200: '#80b8ff',
    300: '#4d9cff',
    400: '#1a80ff',
    500: '#0066e6',   // ← 실제 사용과 다름
    600: '#0052b8',   // ← 실제 사용과 다름
    700: '#003d8a',
    800: '#00295c',
    900: '#00142e',
  }
}
```

#### 변경 후 상태 (목표)

```javascript
// 변경된 상태
colors: {
  primary: {
    50: '#f0f6ff',
    100: '#d9e9ff',
    200: '#b3d4ff',
    300: '#8db8ff',
    400: '#6699ff',
    500: '#005BAC',    // ← 광주은행 메인 색상 (변경됨)
    600: '#00437F',    // ← 호버 다크색 (변경됨)
    700: '#003d8a',
    800: '#00295c',
    900: '#00142e',
  },
  // 추가 커스텀 색상들
  'brand': {
    'light': '#E8F1FB',
    'focus': '#1A73E8',
  },
  'text': {
    'primary': '#212121',
    'secondary': '#6E6E6E',
  },
}
```

#### 작업 체크리스트

- [ ] `tailwind.config.js` 파일 열기
- [ ] primary 색상 팔레트 500, 600 값 변경
  - [ ] primary-500: `#005BAC` (광주은행 색상)
  - [ ] primary-600: `#00437F` (호버 색상)
- [ ] 커스텀 색상 추가 (brand, text)
- [ ] 문법 오류 확인
- [ ] 저장

#### 검증 방법

```bash
# 프로젝트 빌드 테스트
npm run build

# 빌드 성공 시 다음 단계 진행
```

#### 완료 기준

- [x] 파일 저장됨
- [x] 구문 오류 없음
- [x] 빌드 성공
- [x] git에 커밋됨

**완료 상태:** ⏳ 대기 중

---

### 1.2 색상 변경 검증

**목표:** 색상 변경이 프로젝트에 미치는 영향 확인

#### 영향받을 파일들

| 파일명 | 현재 상태 | 변경 후 |
|--------|----------|--------|
| ManualDraftTable.tsx | `#005bac` 사용 중 | 동일하게 표시됨 |
| globals.css | `#005bac` 참조 | 변경 없음 |
| 하드코딩 색상 파일들 | `#005BAC` → `primary-500`로 변경 필요 | 다음 단계에서 처리 |

#### 작업 체크리스트

- [ ] npm run dev로 개발 서버 실행
- [ ] 로그인 페이지 확인 (색상 변경 여부)
- [ ] 메뉴얼 초안 페이지 확인
- [ ] 전반적인 UI 색상 일관성 확인

**완료 상태:** ⏳ 대기 중

---

## 🔄 2단계: ManualDraftListPage 마이그레이션 (필수 & 우선순위 높음)

**예상 소요 시간:** 45분
**담당자:**
**상태:** ⏳ 대기 중

### 2.1 파일 분석

**파일:** `src/pages/manuals/ManualDraftListPage.tsx`
**현재 상태:** styled-components 사용 (97개 라인)
**목표:** Tailwind CSS로 완전 변환

#### 작업 체크리스트

- [ ] 파일 열기
- [ ] 현재 styled-components 컴포넌트 목록 확인:
  - [ ] PageContainer
  - [ ] PageHeader
  - [ ] PageTitle
  - [ ] PageDescription
  - [ ] ErrorAlert
  - [ ] LoadingMessage

### 2.2 Import 제거

**목표:** styled-components 라이브러리 제거

```diff
- import styled from 'styled-components';
  import React, { useState, useCallback, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { getManualDraftList, ManualDraftListResponse } from '@/lib/api/manuals';
  import ManualDraftTable from '@/components/manuals/ManualDraftTable';
```

#### 작업 체크리스트

- [ ] `import styled from 'styled-components';` 라인 삭제 (Line 9)
- [ ] 파일 저장

**완료 상태:** ⏳ 대기 중

---

### 2.3 Styled Components 제거

**목표:** 모든 styled-component 정의 제거 (Line 14~63)

#### 제거할 컴포넌트들

```javascript
// 다음 코드 블록 전체 삭제 (Line 13~64)
// ─────────────────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────────────────

const PageContainer = styled.div`...`
const PageHeader = styled.div`...`
const PageTitle = styled.h1`...`
const PageDescription = styled.p`...`
const ErrorAlert = styled.div`...`
const LoadingMessage = styled.div`...`
```

#### 작업 체크리스트

- [ ] Line 13~64 블록 선택
- [ ] 전체 삭제
- [ ] 파일 저장

**완료 상태:** ⏳ 대기 중

---

### 2.4 JSX에 Tailwind 클래스 적용

**목표:** Return 문에서 styled component를 Tailwind className으로 변환

#### 변경 비포/애프터

```tsx
// ❌ 변경 전
return (
  <PageContainer>
    <PageHeader>
      <PageTitle>메뉴얼 초안 목록</PageTitle>
      <PageDescription>설명</PageDescription>
    </PageHeader>

    {error && <ErrorAlert>{error}</ErrorAlert>}

    {loading ? (
      <LoadingMessage>불러오는 중...</LoadingMessage>
    ) : (
      <ManualDraftTable {...props} />
    )}
  </PageContainer>
);

// ✅ 변경 후
return (
  <div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-6">
    {/* Header */}
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-gray-900">
        메뉴얼 초안 목록
      </h1>
      <p className="text-sm text-gray-600">
        LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
      </p>
    </div>

    {/* Error Alert */}
    {error && (
      <div className="p-3 bg-red-50 border-l-4 border-red-700 rounded text-red-700 text-sm font-medium">
        {error}
      </div>
    )}

    {/* Table */}
    {loading ? (
      <div className="flex items-center justify-center p-10 text-gray-600 text-sm">
        불러오는 중...
      </div>
    ) : (
      <ManualDraftTable
        drafts={drafts}
        totalCount={drafts.length}
        onSelectDraft={(draftId) => navigate(`/manuals/drafts/${draftId}`)}
      />
    )}
  </div>
);
```

#### 작업 체크리스트

- [ ] `<PageContainer>` → `<div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-6">`
- [ ] `<PageHeader>` → `<div className="flex flex-col gap-2">`
- [ ] `<PageTitle>` → `<h1 className="text-2xl font-bold text-gray-900">`
- [ ] `<PageDescription>` → `<p className="text-sm text-gray-600">`
- [ ] `<ErrorAlert>` → `<div className="p-3 bg-red-50 border-l-4 border-red-700 rounded text-red-700 text-sm font-medium">`
- [ ] `<LoadingMessage>` → `<div className="flex items-center justify-center p-10 text-gray-600 text-sm">`
- [ ] 파일 저장

**완료 상태:** ⏳ 대기 중

---

### 2.5 동작 검증

**목표:** 마이그레이션 후 페이지 정상 작동 확인

#### 검증 체크리스트

- [ ] npm run dev 실행
- [ ] 브라우저에서 `/manuals/drafts` 페이지 접속
- [ ] 페이지 레이아웃 시각적 확인
- [ ] 에러 메시지 표시 확인 (네트워크 끊겨도 에러 알림이 표시되는가)
- [ ] 로딩 상태 메시지 표시 확인
- [ ] 테이블이 올바르게 렌더링되는가
- [ ] 응답형 디자인 확인 (모바일 사이즈로 축소 후 확인)

**완료 상태:** ⏳ 대기 중

---

### 2.6 Git 커밋

**메시지:** `refactor: ManualDraftListPage에서 styled-components → Tailwind CSS로 마이그레이션`

```bash
git add src/pages/manuals/ManualDraftListPage.tsx
git commit -m "refactor: ManualDraftListPage에서 styled-components → Tailwind CSS로 마이그레이션

- styled-components import 제거
- 모든 styled component를 Tailwind className으로 변환
- 스타일 동작 일관성 유지"
```

#### 작업 체크리스트

- [ ] 파일 staged
- [ ] 커밋 실행
- [ ] 로그에 커밋 표시됨

**완료 상태:** ⏳ 대기 중

---

## 🎨 3단계: 색상 하드코딩 제거 (우선순위 높음)

**예상 소요 시간:** 40분
**담당자:**
**상태:** ⏳ 대기 중

### 3.1 LoginPage.tsx 수정

**파일:** `src/pages/auth/LoginPage.tsx`
**라인:** 30, 34
**문제:** `bg-[#005BAC]`, `text-[#005BAC]` 사용

#### 변경 전

```tsx
// Line 30
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-[#005BAC] text-2xl font-bold text-white">

// Line 34
<h1 className="text-2xl font-bold text-[#005BAC]">{title}</h1>
```

#### 변경 후

```tsx
// Line 30
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary-500 text-2xl font-bold text-white">

// Line 34
<h1 className="text-2xl font-bold text-primary-500">{title}</h1>
```

#### 작업 체크리스트

- [ ] 파일 열기
- [ ] Line 30 수정: `bg-[#005BAC]` → `bg-primary-500`
- [ ] Line 34 수정: `text-[#005BAC]` → `text-primary-500`
- [ ] 파일 저장
- [ ] 브라우저 확인 (색상이 정상 표시되는가)

**완료 상태:** ⏳ 대기 중

---

### 3.2 RegisterPage.tsx 수정

**파일:** `src/pages/auth/RegisterPage.tsx`
**라인:** 26, 27
**문제:** `bg-[#005BAC]`, `text-[#005BAC]` 사용

#### 변경 전

```tsx
// Line 26-27
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-[#005BAC]">
<h1 className="text-2xl font-bold text-[#005BAC]">
```

#### 변경 후

```tsx
// Line 26-27
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary-500">
<h1 className="text-2xl font-bold text-primary-500">
```

#### 작업 체크리스트

- [ ] 파일 열기
- [ ] Line 26 수정: `bg-[#005BAC]` → `bg-primary-500`
- [ ] Line 27 수정: `text-[#005BAC]` → `text-primary-500`
- [ ] 파일 저장
- [ ] 브라우저 확인

**완료 상태:** ⏳ 대기 중

---

### 3.3 ManualDraftResultPage.tsx 수정

**파일:** `src/pages/manuals/ManualDraftResultPage.tsx`
**라인:** 57
**문제:** `text-[#005BAC]` 사용

#### 변경 전

```tsx
// Line 57
<Spinner size="lg" className="mb-4 text-[#005BAC]" />
```

#### 변경 후

```tsx
// Line 57
<Spinner size="lg" className="mb-4 text-primary-500" />
```

#### 작업 체크리스트

- [ ] 파일 열기
- [ ] Line 57 수정: `text-[#005BAC]` → `text-primary-500`
- [ ] 파일 저장
- [ ] 브라우저 확인

**완료 상태:** ⏳ 대기 중

---

### 3.4 ManualEditPage.tsx 수정

**파일:** `src/pages/manuals/ManualEditPage.tsx`
**라인:** 47
**문제:** `border-t-[#005BAC]` 사용

#### 변경 전

```tsx
// Line 47
<div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#005BAC] rounded-full animate-spin mb-4"></div>
```

#### 변경 후

```tsx
// Line 47
<div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin mb-4"></div>
```

#### 작업 체크리스트

- [ ] 파일 열기
- [ ] Line 47 수정: `border-t-[#005BAC]` → `border-t-primary-500`
- [ ] 파일 저장
- [ ] 브라우저 확인

**완료 상태:** ⏳ 대기 중

---

### 3.5 전체 검증

#### 작업 체크리스트

- [ ] 모든 4개 파일 수정 완료
- [ ] 빌드 성공 확인 (npm run build)
- [ ] 각 페이지 방문하여 색상 확인
  - [ ] /auth/login
  - [ ] /auth/register
  - [ ] /manuals/drafts/결과 페이지
  - [ ] /manuals/edit 페이지

**완료 상태:** ⏳ 대기 중

---

### 3.6 Git 커밋

**메시지:** `refactor: 색상 하드코딩 제거 및 Tailwind 표준색상 적용`

```bash
git add src/pages/auth/LoginPage.tsx \
        src/pages/auth/RegisterPage.tsx \
        src/pages/manuals/ManualDraftResultPage.tsx \
        src/pages/manuals/ManualEditPage.tsx

git commit -m "refactor: 색상 하드코딩 제거 및 Tailwind 표준색상 적용

변경 파일:
- LoginPage.tsx: #005BAC → primary-500 (2개)
- RegisterPage.tsx: #005BAC → primary-500 (2개)
- ManualDraftResultPage.tsx: #005BAC → primary-500 (1개)
- ManualEditPage.tsx: #005BAC → primary-500 (1개)

모든 색상 참조를 Tailwind 표준 색상으로 일관성 있게 통일"
```

#### 작업 체크리스트

- [ ] 파일들 staged
- [ ] 커밋 실행
- [ ] 로그에 커밋 표시됨

**완료 상태:** ⏳ 대기 중

---

## 🔍 4단계: 스피너 색상 통일 (우선순위 중간)

**예상 소요 시간:** 10분
**담당자:**
**상태:** ⏳ 대기 중

### 4.1 ManualDetailPage.tsx 검토

**파일:** `src/pages/manuals/ManualDetailPage.tsx`
**라인:** 27
**현재 상태:** `border-t-blue-700` 사용

#### 확인 사항

```tsx
// Line 27
<div className="w-12 h-12 border-4 border-gray-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
```

#### 질문

- [ ] 이 파란색이 광주은행 브랜드 색상과 일치하는가?
- [ ] 다른 로딩 스피너와 동일한 색상을 사용하고 있는가?

#### 결정

```
□ primary-500으로 변경 (권장)
□ 현재 상태 유지 (불일치 용인)
□ 다른 색상 사용
```

#### 작업 체크리스트 (primary-500으로 변경 시)

- [ ] 파일 열기
- [ ] Line 27 수정: `border-t-blue-700` → `border-t-primary-500`
- [ ] 파일 저장
- [ ] 브라우저 확인

**완료 상태:** ⏳ 대기 중

---

## 📝 5단계: 임시 페이지 스타일링 (우선순위 낮음)

**예상 소요 시간:** 2시간 이상
**담당자:**
**상태:** ⏳ 향후 계획

### 5.1 대상 파일들

| 파일명 | 현재 상태 | 작업 |
|--------|----------|------|
| AdminSettingsPage.tsx | 빈 파일 (9줄) | 기능 구현 시 함께 스타일링 |
| AdminUsersPage.tsx | 빈 파일 (9줄) | 기능 구현 시 함께 스타일링 |
| DashboardPage.tsx | 빈 파일 (9줄) | 기능 구현 시 함께 스타일링 |
| ManualHistoryPage.tsx | 빈 파일 (9줄) | 기능 구현 시 함께 스타일링 |

### 5.2 처리 방법

이 파일들은 기능 구현 시 함께 Tailwind CSS로 스타일링합니다.

#### 작업 체크리스트

- [ ] 각 페이지 기능 구현 시 `src/styles/globals.css` 스타일 참조
- [ ] Tailwind CSS 표준 준수
- [ ] 색상은 설정된 primary, gray, status 색상만 사용
- [ ] 완료 후 이 문서 업데이트

**완료 상태:** ⏳ 향후 계획

---

## 📊 진행 현황 요약

### 완료된 작업

```
□ 1단계: 색상 체계 표준화
  □ 1.1 tailwind.config.js 수정
  □ 1.2 색상 변경 검증

□ 2단계: ManualDraftListPage 마이그레이션
  □ 2.1 파일 분석
  □ 2.2 Import 제거
  □ 2.3 Styled Components 제거
  □ 2.4 Tailwind 클래스 적용
  □ 2.5 동작 검증
  □ 2.6 Git 커밋

□ 3단계: 색상 하드코딩 제거
  □ 3.1 LoginPage.tsx 수정
  □ 3.2 RegisterPage.tsx 수정
  □ 3.3 ManualDraftResultPage.tsx 수정
  □ 3.4 ManualEditPage.tsx 수정
  □ 3.5 전체 검증
  □ 3.6 Git 커밋

□ 4단계: 스피너 색상 통일
  □ 4.1 ManualDetailPage.tsx 검토 및 수정

□ 5단계: 임시 페이지 스타일링
  □ 5.1 향후 계획 (기능 구현 시)
```

### 예상 타임라인

| 단계 | 작업 시간 | 예상 완료일 |
|------|----------|-----------|
| 1단계 | 30분 | 2025-12-13 |
| 2단계 | 45분 | 2025-12-13 |
| 3단계 | 40분 | 2025-12-14 |
| 4단계 | 10분 | 2025-12-14 |
| **전체** | **125분 (약 2시간)** | **2025-12-14** |

---

## 🔗 참고 자료

- **가이드 문서:** [UI_UX_STYLE_GUIDE.md](UI_UX_STYLE_GUIDE.md)
- **설정 파일:** `tailwind.config.js`
- **글로벌 스타일:** `src/styles/globals.css`
- **Tailwind 공식 문서:** https://tailwindcss.com/docs

---

## 📞 문의 사항

문제 발생 시 다음을 확인하세요:

1. **빌드 오류:** `npm run build` 실행 후 에러 메시지 확인
2. **스타일 미적용:** 브라우저 캐시 삭제 또는 `npm run dev` 재시작
3. **색상 문제:** `tailwind.config.js` 색상 정의 확인

---

**최종 업데이트:** 2025-12-12
**버전:** v1.0
**상태:** 🚀 준비 완료

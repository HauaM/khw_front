# 🎨 UI/UX 스타일링 가이드 & 표준화 분석 보고서

**작성일:** 2025-12-12
**상태:** 진행 중 (표준화 작업 필요)
**대상:** 프론트엔드 개발팀

---

## 📋 목차

1. [프로젝트 현황](#프로젝트-현황)
2. [스타일링 표준](#스타일링-표준)
3. [문제점 분석](#문제점-분석)
4. [페이지별 상세 분석](#페이지별-상세-분석)
5. [개선 계획](#개선-계획)
6. [구현 가이드](#구현-가이드)

---

## 프로젝트 현황

### 전체 현황 대시보드

```
총 페이지 수: 20개 파일
├─ ✅ 표준 준수 (Tailwind CSS)     : 14개 (70%)
├─ ⚠️  주의 필요                  : 1개  (5%)
├─ ❌ 표준 미준수 (HEX 하드코딩)   : 4개  (20%)
└─ ❌ 심각한 불일치 (styled-comp) : 1개  (5%)
```

### 스타일링 방식 분포

| 방식 | 파일 수 | 비율 | 상태 |
|------|--------|------|------|
| **Tailwind CSS** | 16개 | 80% | ✅ 표준 |
| **styled-components** | 1개 | 5% | ❌ 제거 필요 |
| **기본 HTML (임시)** | 3개 | 15% | ⏳ 향후 구현 |

### 색상 사용 현황

| 범주 | 개수 | 비율 | 상태 |
|------|------|------|------|
| ✓ 표준 Tailwind | 14개 | 70% | 양호 |
| ⚠️ 임의 색상값 | 5개 | 25% | 개선 필요 |
| ❌ styled-components | 1개 | 5% | 긴급 수정 |

---

## 스타일링 표준

### 공식 표준: Tailwind CSS

이 프로젝트의 **공식 스타일링 표준은 Tailwind CSS**입니다.

#### 1. 올바른 사용 예시 ✅

```tsx
// ✅ 좋은 예시: Tailwind CSS 사용
const HomePage: React.FC = () => {
  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">홈</h2>
        <p className="text-sm text-gray-600">메인 페이지입니다</p>
      </div>
    </div>
  );
};
```

**사용된 Tailwind 클래스:**
- `px-4 py-6 md:px-6` - 반응형 패딩
- `mb-6` - 마진 (margin-bottom)
- `text-2xl font-bold text-gray-900` - 타이포그래피와 색상
- `text-sm text-gray-600` - 작은 텍스트와 회색

#### 2. 잘못된 사용 예시 ❌

```tsx
// ❌ 나쁜 예시 1: 하드코딩된 색상
<div className="bg-[#005BAC] text-white">내용</div>

// ❌ 나쁜 예시 2: 인라인 스타일
<div style={{ padding: '16px', color: '#005BAC' }}>내용</div>

// ❌ 나쁜 예시 3: styled-components
const Container = styled.div`
  background-color: #005BAC;
  padding: 16px;
`;
```

#### 3. 색상 사용 규칙

**규칙 1: Tailwind 설정 색상 참조**

```tsx
// ✅ 올바른 방법
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  버튼
</button>

// ❌ 잘못된 방법
<button className="bg-[#005BAC] hover:bg-[#00437F] text-white">
  버튼
</button>
```

**규칙 2: 색상 팔레트 구조**

Tailwind config에 정의된 색상을 사용:

```javascript
// tailwind.config.js
colors: {
  primary: {     // 광주은행 브랜드 색상
    500: '#005BAC',
    600: '#00437F',
  },
  gray: {        // 기본 텍스트/배경
    50: '#f9fafb',
    100: '#f3f4f6',
    900: '#111827',
  },
  success: {...}, // 성공 상태
  error: {...},   // 에러 상태
}
```

사용 방법:
```tsx
<div className="bg-primary-500">          // 광주은행 색상
<div className="text-gray-900">           // 기본 검은색
<div className="bg-success">              // 성공 색상
```

#### 4. 반응형 디자인

```tsx
// ✅ Tailwind 반응형 클래스 사용
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 모바일: 1열, 태블릿: 2열, 데스크탑: 3열 */}
</div>

// ✅ 텍스트 크기 반응형
<h1 className="text-xl md:text-2xl lg:text-3xl">제목</h1>

// ✅ 패딩 반응형
<div className="px-4 py-2 md:px-6 md:py-4">내용</div>
```

---

## 문제점 분석

### 문제 1️⃣: 색상 체계 불일치 (가장 심각)

**현황:**
프로젝트에서 실제로 사용되는 색상들이 `tailwind.config.js`에 정의된 색상과 다릅니다.

```
실제 사용 색상 vs Tailwind Config 정의
─────────────────────────────────────
#005BAC  (광주은행 메인) ≠ primary-500: #0066e6
#00437F  (호버 상태)     ≠ primary-600: #0052b8
#1A73E8  (포커스)        ≠ 미정의
#E8F1FB  (선택 배경)     ≠ 미정의
```

**영향:**
```
❌ 브랜드 색상을 한 곳에서 관리하지 못함
❌ 색상 변경 시 모든 파일을 수정해야 함
❌ 개발자 간 색상 사용 기준이 불명확함
❌ Tailwind의 색상 체계를 제대로 활용하지 못함
❌ 유지보수 난이도 높음
```

### 문제 2️⃣: styled-components 혼용 (두 번째 심각)

**위반 파일:**
- `src/pages/manuals/ManualDraftListPage.tsx`

```tsx
// ❌ 문제: styled-components 사용 (유일한 파일)
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #fafafa;  // HEX 색상 하드코딩
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  color: #212121;  // HEX 색상 하드코딩
`;
```

**왜 문제인가:**
```
❌ 프로젝트의 97%는 Tailwind를 사용하는데 유일하게 다른 방식 사용
❌ CSS-in-JS 라이브러리 추가 로드로 번들 크기 증가 (~30KB)
❌ 스타일링 방식 불일치로 신규 개발자 혼동
❌ 유지보수 복잡도 증가
```

**✅ 개선 방법:**

```tsx
// ✅ Tailwind CSS로 마이그레이션
const ManualDraftListPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          메뉴얼 초안 목록
        </h1>
        <p className="text-sm text-gray-600">
          설명 텍스트
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
        <ManualDraftTable {...props} />
      )}
    </div>
  );
};
```

### 문제 3️⃣: 색상 하드코딩 (세 번째)

**영향받는 파일들:**

| 파일명 | 하드코딩 색상 | 개수 |
|--------|---------------|------|
| LoginPage.tsx | `#005BAC` | 2개 |
| RegisterPage.tsx | `#005BAC` | 2개 |
| ManualDraftResultPage.tsx | `#005BAC` | 1개 |
| ManualEditPage.tsx | `#005BAC` | 1개 |
| ManualDetailPage.tsx | `blue-700` | 1개 (일관성 검토 필요) |
| **합계** | | **7개** |

**예시 코드:**

```tsx
// ❌ LoginPage.tsx
<div className="bg-[#005BAC] text-white">KJB</div>
<h1 className="text-[#005BAC]">로그인</h1>

// ✅ 개선안
<div className="bg-primary-500 text-white">KJB</div>
<h1 className="text-primary-500">로그인</h1>
```

---

## 페이지별 상세 분석

### 📋 전체 페이지 목록 (20개)

#### 표준 준수 페이지 ✅ (14개)

1. **HomePage.tsx** - 표준 Tailwind 색상 사용
2. **CommonCodeManagementPage.tsx** - 계산값 포함 적절하게 사용
3. **ConsultationCreatePage.tsx** - 간결한 표준 사용
4. **ConsultationDetailPage.tsx** - 표준 Tailwind 사용
5. **ConsultationSearchPage.tsx** - 커스텀 색상 적절히 사용
6. **ManualSearchPage.tsx** - 간결한 Tailwind 사용
7. **ManualVersionComparePage.tsx** - 표준 Tailwind 클래스 사용
8. **ManualReviewDetailPage.tsx** - 최소한의 스타일링
9. **ManualReviewTaskDetailPage.tsx** - 표준 색상 사용
10. **ReviewTaskListPage.tsx** - 표준 Tailwind CSS 사용
11. **AdminSettingsPage.tsx** - 임시 페이지 (향후 구현)
12. **AdminUsersPage.tsx** - 임시 페이지 (향후 구현)
13. **DashboardPage.tsx** - 임시 페이지 (향후 구현)
14. **ManualHistoryPage.tsx** - 임시 페이지 (향후 구현)

#### 개선 필요 페이지 ⚠️ (6개)

| 파일명 | 문제점 | 심각도 | 작업 |
|--------|--------|--------|------|
| **ManualDraftListPage.tsx** | styled-components 사용 | 🔴 높음 | 마이그레이션 |
| **LoginPage.tsx** | 색상 하드코딩 (2개) | 🟡 중간 | 색상 제거 |
| **RegisterPage.tsx** | 색상 하드코딩 (2개) | 🟡 중간 | 색상 제거 |
| **ManualDraftResultPage.tsx** | 색상 하드코딩 (1개) | 🟡 중간 | 색상 제거 |
| **ManualEditPage.tsx** | 색상 하드코딩 (1개) | 🟡 중간 | 색상 제거 |
| **ManualDetailPage.tsx** | 색상 일관성 확인 | 🟢 낮음 | 검토 필요 |

---

## 개선 계획

### 📅 단계별 실행 계획

#### **1단계: 색상 체계 표준화 (필수 & 즉시)**

**작업 파일:** `tailwind.config.js`

**목표:** Tailwind config의 색상을 실제 사용 색상과 일치시키기

**변경 내용:**

```javascript
// tailwind.config.js (변경 전)
colors: {
  primary: {
    500: '#0066e6',  // ← 실제 사용과 다름
    600: '#0052b8',  // ← 실제 사용과 다름
  }
}

// tailwind.config.js (변경 후) ✅
colors: {
  primary: {
    50: '#f0f6ff',
    100: '#d9e9ff',
    200: '#b3d4ff',
    300: '#8db8ff',
    400: '#6699ff',
    500: '#005BAC',    // ← 광주은행 메인 색상
    600: '#00437F',    // ← 호버 상태
    700: '#003d8a',
    800: '#00295c',
    900: '#00142e',
  },
  // 추가 필요한 색상들
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

**체크리스트:**
- [ ] `tailwind.config.js` 업데이트
- [ ] 색상 팔레트 검증 (디자이너 확인)
- [ ] 변경사항 커밋

---

#### **2단계: ManualDraftListPage 마이그레이션 (필수 & 우선순위 높음)**

**작업 파일:** `src/pages/manuals/ManualDraftListPage.tsx`

**목표:** styled-components → Tailwind CSS로 완전 마이그레이션

**변경 전:**
```tsx
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #fafafa;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #212121;
  margin: 0;
`;

const ErrorAlert = styled.div`
  padding: 12px 16px;
  background-color: #ffebee;
  border-left: 4px solid #c62828;
  color: #c62828;
`;

// JSX에서 사용
return (
  <PageContainer>
    <PageTitle>메뉴얼 초안 목록</PageTitle>
    {error && <ErrorAlert>{error}</ErrorAlert>}
  </PageContainer>
);
```

**변경 후:**
```tsx
// styled-components import 제거

const ManualDraftListPage: React.FC = () => {
  // ... 로직 ...

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          메뉴얼 초안 목록
        </h1>
        <p className="text-sm text-gray-600">
          LLM으로 생성된 DRAFT 메뉴얼을 조회합니다
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
};
```

**체크리스트:**
- [ ] styled-components import 제거
- [ ] 모든 styled 컴포넌트를 className으로 변환
- [ ] 스타일 동작 검증 (브라우저에서 확인)
- [ ] 변경사항 커밋

---

#### **3단계: 색상 하드코딩 제거 (우선순위 높음)**

**작업 파일:**
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/pages/manuals/ManualDraftResultPage.tsx`
- `src/pages/manuals/ManualEditPage.tsx`

**변경 예시 (LoginPage):**

```tsx
// ❌ 변경 전
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#005BAC] text-2xl font-bold text-white">
  KJB
</div>
<h1 className="text-2xl font-bold text-[#005BAC]">{title}</h1>

// ✅ 변경 후
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary-500 text-2xl font-bold text-white">
  KJB
</div>
<h1 className="text-2xl font-bold text-primary-500">{title}</h1>
```

**체크리스트:**
- [ ] LoginPage.tsx 수정
- [ ] RegisterPage.tsx 수정
- [ ] ManualDraftResultPage.tsx 수정
- [ ] ManualEditPage.tsx 수정
- [ ] 모든 변경사항 테스트
- [ ] 변경사항 커밋

---

#### **4단계: 스피너 색상 통일 (우선순위 중간)**

**작업 파일:** `src/pages/manuals/ManualDetailPage.tsx`

```tsx
// ❌ 현재
<div className="border-t-blue-700"></div>

// ✅ 변경 후
<div className="border-t-primary-500"></div>
```

---

#### **5단계: 임시 페이지 스타일링 (우선순위 낮음)**

**작업 파일:**
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminUsersPage.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/manuals/ManualHistoryPage.tsx`

향후 기능 구현 시 Tailwind CSS로 스타일링 적용

---

## 구현 가이드

### 초보 개발자를 위한 Tailwind CSS 사용법

#### 1. 기본 클래스 구조

```tsx
// 패딩과 마진
className="p-4"              // 모든 방향 padding
className="px-4 py-2"        // 좌우 px, 상하 py
className="pt-4 pb-2 pl-2"   // 각 방향별 지정

// 텍스트
className="text-lg"          // 글자 크기
className="font-bold"        // 폰트 무게
className="text-gray-900"    // 색상

// 배경
className="bg-white"         // 배경색
className="rounded-lg"       // 모서리 둥글기

// 레이아웃
className="flex gap-4"       // flex 레이아웃, 간격
className="grid grid-cols-2" // 그리드 2열
```

#### 2. 색상 사용 규칙

```tsx
// ✅ 올바른 방법
<div className="bg-primary-500">OK</div>
<div className="text-gray-900">OK</div>
<div className="border border-gray-300">OK</div>

// ❌ 하지 말아야 할 방법
<div className="bg-[#005BAC]">NO</div>
<div style={{ color: '#005BAC' }}>NO</div>
<div style={{ padding: '16px' }}>NO</div>
```

#### 3. 반응형 디자인

```tsx
// 모바일 우선 접근
className="text-sm md:text-base lg:text-lg"
// 기본(모바일): text-sm
// md (≥768px): text-base
// lg (≥1024px): text-lg

className="flex-col md:flex-row"
// 기본: 세로 배열
// md 이상: 가로 배열

className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
// 모바일: 1열
// 태블릿: 2열
// 데스크탑: 3열
```

#### 4. 자주 사용하는 패턴

```tsx
// 버튼
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
  버튼
</button>

// 카드
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  카드 내용
</div>

// 입력 필드
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>

// 에러 메시지
<div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
  오류 메시지
</div>

// 성공 메시지
<div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
  성공 메시지
</div>

// 정보 배너
<div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
  정보
</div>
```

---

### 개발할 때 체크리스트

신규 페이지나 컴포넌트를 개발할 때 이 체크리스트를 확인하세요:

```
[ ] Tailwind CSS만 사용했는가?
    - styled-components 미사용
    - 인라인 스타일(style={}) 미사용
    - CSS 파일 import 미사용

[ ] 색상은 config에서 정의한 것을 사용했는가?
    - bg-[#...] 같은 하드코딩 색상 미사용
    - HEX값 직접 입력 미사용

[ ] 반응형 디자인을 고려했는가?
    - sm, md, lg 브레이크포인트 사용
    - 모바일 우선 접근

[ ] 글로벌 색상을 따랐는가?
    - primary-500 (메인 색상)
    - gray-900, gray-600 (텍스트)
    - red-50, red-600 (에러)
    - green-50, green-600 (성공)
```

---

### 편리한 팁과 도구

#### 1. Tailwind CSS 공식 문서
https://tailwindcss.com/docs

#### 2. 색상 팔레트 확인
프로젝트의 `tailwind.config.js`에서 정의된 색상 사용

```javascript
// tailwind.config.js
colors: {
  primary: { 500, 600, ... },
  gray: { 50, 100, 600, 900, ... },
  success: { ... },
  error: { ... },
}
```

#### 3. IntelliSense 활용
VS Code에서 Tailwind CSS 플러그인 설치:
- Tailwind CSS IntelliSense

#### 4. 클래스 생성 도구
https://tailwindcss.com/ 공식 사이트의 클래스 생성기 활용

---

## 색상 팔레트 레퍼런스

### Primary Colors (광주은행 브랜드)

```
primary-50   #f0f6ff   (매우 밝음)
primary-100  #d9e9ff
primary-200  #b3d4ff
primary-300  #8db8ff
primary-400  #6699ff
primary-500  #005BAC   ← 메인 색상
primary-600  #00437F   ← 호버 색상
primary-700  #003d8a
primary-800  #00295c
primary-900  #00142e   (매우 어두움)
```

### Gray Colors (기본 텍스트/배경)

```
gray-50      #f9fafb   (배경 - 매우 밝음)
gray-100     #f3f4f6   (배경)
gray-600     #4b5563   (보조 텍스트)
gray-900     #111827   (기본 텍스트 - 검은색)
```

### Status Colors (상태)

```
red-50       #fef2f2   (에러 배경)
red-600      #dc2626   (에러 텍스트)
green-50     #f0fdf4   (성공 배경)
green-600    #16a34a   (성공 텍스트)
blue-50      #eff6ff   (정보 배경)
blue-600     #2563eb   (정보 텍스트)
```

---

## 문제 발생 시 해결 방법

### Q1: 색상이 예상과 다르게 나옵니다

**확인 사항:**
```
1. tailwind.config.js에 색상이 정의되어 있는가?
2. className에 올바른 색상 이름을 사용했는가?
   - ✅ className="bg-primary-500"
   - ❌ className="bg-[#005BAC]"
3. VSCode 캐시를 새로고침했는가?
   - Ctrl+Shift+P → "Tailwind CSS: Clear Cache"
```

### Q2: 스타일이 적용되지 않습니다

**확인 사항:**
```
1. 올바른 className 문법인가?
   - className="..." (O)
   - className={...} (X - 문자열이어야 함)
2. Tailwind 클래스 이름이 정확한가?
   - Tailwind 공식 문서 확인
3. 브라우저 개발자 도구에서 실제 스타일 확인
```

### Q3: 임의의 색상값(arbitrary values)은 언제 사용하나요?

**사용해야 하는 경우:**
- 설정에 없는 특수한 값이 필요할 때 (예: 동적 계산)
- 임시로 사용할 때 (나중에 config에 추가)

**예시:**
```tsx
// 불가피하게 필요한 경우만
<div className="h-[calc(100vh-280px)]">

// 최대한 피할 것
<div className="text-[#005BAC]">  // ❌ 하드코딩 색상
<div className="p-[16px]">         // ❌ 설정된 값 사용
```

---

## 다음 작업

### 🎯 즉시 처리 (이번 주)

1. **tailwind.config.js 색상 업데이트**
   - 광주은행 브랜드 색상 반영
   - PR 검토 및 merge

2. **ManualDraftListPage.tsx 마이그레이션**
   - styled-components 제거
   - Tailwind CSS로 완전 변환
   - 동작 검증

### 📅 1주일 내 처리

3. **색상 하드코딩 제거**
   - LoginPage, RegisterPage
   - ManualDraftResultPage, ManualEditPage
   - 4개 파일 모두 수정

4. **색상 일관성 검토**
   - ManualDetailPage 스피너 색상 확인

### 🔄 향후 계획

5. **임시 페이지 스타일링**
   - 기능 구현 시 함께 진행

6. **신규 개발 가이드**
   - 팀 내 가이드라인 공유
   - 코드 리뷰 체크리스트 운영

---

## 참고 자료

### 공식 문서
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Tailwind CSS 설정 가이드](https://tailwindcss.com/docs/configuration)
- [Color Palette Reference](https://tailwindcss.com/docs/customizing-colors)

### 프로젝트 파일
- **설정 파일:** `tailwind.config.js`
- **글로벌 스타일:** `src/styles/globals.css`
- **색상 레퍼런스:** 본 문서의 "색상 팔레트 레퍼런스" 섹션

---

## 최종 요약

| 항목 | 현황 | 목표 | 상태 |
|------|------|------|------|
| **Tailwind 사용 비율** | 80% | 100% | ⏳ 진행 중 |
| **색상 표준화** | 분산된 하드코딩 | 중앙 관리 | ⏳ 진행 중 |
| **스타일링 방식** | Tailwind + styled-comp | 단일 표준(Tailwind) | ⏳ 진행 중 |
| **개발 일관성** | 불일치 | 일관성 있음 | ⏳ 진행 중 |

**결론:** 프로젝트의 기반은 매우 좋습니다. 색상 체계만 통일하고 1개 파일을 마이그레이션하면 완벽한 표준화가 완성됩니다! 🚀

---

**마지막 업데이트:** 2025-12-12
**작성자:** UI/UX 전문가
**버전:** v1.0

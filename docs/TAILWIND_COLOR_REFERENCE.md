# 🎨 Tailwind CSS 색상 레퍼런스 가이드

**프로젝트:** KWH 지식관리시스템
**목적:** 개발 중 빠르게 참조할 수 있는 색상 팔레트 가이드
**마지막 업데이트:** 2025-12-12

---

## 📋 목차

1. [색상 팔레트](#색상-팔레트)
2. [색상별 사용 예시](#색상별-사용-예시)
3. [자주 쓰는 패턴](#자주-쓰는-패턴)
4. [색상 선택 가이드](#색상-선택-가이드)
5. [금지된 사용법](#금지된-사용법)

---

## 색상 팔레트

### Primary Colors (광주은행 브랜드)

```
primary-50   #f0f6ff   ○ 매우 밝은 배경        (거의 사용 안 함)
primary-100  #d9e9ff   ○ 밝은 배경             (호버 상태)
primary-200  #b3d4ff   ○ 연한 배경             (포커스 배경)
primary-300  #8db8ff   ○ 중간 배경             (드물게 사용)
primary-400  #6699ff   ○ 밝은 주색상           (드물게 사용)
primary-500  #005BAC   ● 메인 색상 ⭐         (가장 많이 사용)
primary-600  #00437F   ● 호버/선택 색상 ⭐    (버튼 호버 등)
primary-700  #003d8a   ○ 다크 색상             (아주 어두워야 할 때)
primary-800  #00295c   ○ 매우 다크 색상       (거의 사용 안 함)
primary-900  #00142e   ○ 가장 어두운 색상     (거의 사용 안 함)
```

**가장 자주 사용하는 색상:** `primary-500`, `primary-600`

### Gray Colors (텍스트 & 배경)

```
gray-50      #f9fafb   ○ 배경 (매우 밝음)
gray-100     #f3f4f6   ○ 배경 (밝음)
gray-200     #e5e7eb   ○ 테두리/선
gray-300     #d1d5db   ○ 테두리/선
gray-400     #9ca3af   ○ 보조 텍스트 (거의 사용 안 함)
gray-500     #6b7280   ○ 보조 텍스트 (거의 사용 안 함)
gray-600     #4b5563   ○ 보조 텍스트
gray-700     #374151   ○ 보조 텍스트
gray-800     #1f2937   ○ 어두운 텍스트 (거의 사용 안 함)
gray-900     #111827   ● 기본 텍스트 (검은색) ⭐
```

**가장 자주 사용하는 색상:** `gray-900` (텍스트), `gray-100` (배경)

### Status Colors (상태 표시)

#### Success (성공)
```
green-50     #f0fdf4   ○ 배경
green-100    #dcfce7   ○ 밝은 배경
green-600    #16a34a   ● 텍스트/테두리
```

#### Error (에러)
```
red-50       #fef2f2   ○ 배경
red-100      #fee2e2   ○ 밝은 배경
red-600      #dc2626   ● 텍스트/테두리
```

#### Warning (경고)
```
yellow-50    #fffbeb   ○ 배경
yellow-100   #fef3c7   ○ 밝은 배경
yellow-600   #d97706   ● 텍스트/테두리
```

#### Info (정보)
```
blue-50      #eff6ff   ○ 배경
blue-100     #dbeafe   ○ 밝은 배경
blue-600     #2563eb   ● 텍스트/테두리
```

### Custom Brand Colors

```
brand-light  #E8F1FB   ○ 선택됨/호버 배경
brand-focus  #1A73E8   ○ 포커스 링/특수 강조
text-primary #212121   ● 제목/주 텍스트
text-secondary #6E6E6E ○ 보조 텍스트/설명
```

---

## 색상별 사용 예시

### 🔵 Primary 색상 (가장 많이 사용)

#### primary-500 (광주은행 메인 색상) - 사용 빈도: 매우 높음

```tsx
// 버튼 배경
<button className="bg-primary-500 text-white hover:bg-primary-600">
  클릭
</button>

// 텍스트 링크
<a className="text-primary-500 hover:underline">링크</a>

// 배경 강조
<div className="bg-primary-50 text-primary-600 p-4 rounded">
  중요한 내용
</div>

// 테두리
<div className="border-2 border-primary-500">테두리</div>

// 로딩 스피너
<div className="border-t-primary-500">스피너</div>
```

#### primary-600 (호버/선택 상태) - 사용 빈도: 높음

```tsx
// 버튼 호버 상태
<button className="bg-primary-500 hover:bg-primary-600">
  버튼
</button>

// 테이블 행 선택
<tr className="hover:bg-primary-100">테이블 행</tr>

// 활성 탭
<div className="border-b-2 border-primary-600">활성 탭</div>
```

### ⚫ Gray 색상 (두 번째로 많이 사용)

#### gray-900 (기본 텍스트) - 사용 빈도: 매우 높음

```tsx
// 제목
<h1 className="text-2xl font-bold text-gray-900">제목</h1>

// 기본 텍스트
<p className="text-gray-900">본문</p>

// 작은 제목
<h2 className="text-lg font-semibold text-gray-900">소제목</h2>
```

#### gray-600 (보조 텍스트) - 사용 빈도: 높음

```tsx
// 설명 텍스트
<p className="text-sm text-gray-600">설명입니다</p>

// 보조 정보
<span className="text-gray-600">추가 정보</span>

// 비활성 상태
<button className="text-gray-600 opacity-50">비활성</button>
```

#### gray-100 (배경) - 사용 빈도: 높음

```tsx
// 섹션 배경
<div className="bg-gray-100 p-6 rounded-lg">
  콘텐츠
</div>

// 대체 행 (테이블)
<tr className="bg-gray-100">테이블 행</tr>
```

#### gray-50 (매우 밝은 배경) - 사용 빈도: 중간

```tsx
// 페이지 배경
<div className="bg-gray-50 min-h-screen">
  페이지
</div>

// 라이트 섹션
<div className="bg-gray-50 p-4 rounded">
  라이트 섹션
</div>
```

#### gray-200, gray-300 (테두리/선) - 사용 빈도: 높음

```tsx
// 테두리
<div className="border border-gray-200">테두리</div>

// 구분선
<div className="border-t border-gray-300"></div>

// 구분 선
<hr className="border-gray-200" />
```

### 🟢 Success 색상 - 사용 빈도: 중간

```tsx
// 성공 메시지
<div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded">
  ✓ 성공했습니다
</div>

// 성공 배지
<span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
  완료
</span>

// 성공 버튼
<button className="bg-green-600 text-white hover:bg-green-700">
  승인
</button>
```

### 🔴 Error 색상 - 사용 빈도: 중간

```tsx
// 에러 메시지
<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
  ✗ 오류가 발생했습니다
</div>

// 에러 테두리 입력
<input className="border border-red-500 focus:ring-red-500" />

// 에러 버튼
<button className="bg-red-600 text-white hover:bg-red-700">
  삭제
</button>

// 경고 배경
<div className="bg-red-50 p-4 rounded">
  경고 메시지
</div>
```

### 🟡 Warning 색상 - 사용 빈도: 낮음

```tsx
// 경고 메시지
<div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-3 rounded">
  ⚠ 주의하세요
</div>
```

### 🔵 Info 색상 - 사용 빈도: 낮음

```tsx
// 정보 메시지
<div className="bg-blue-50 border-l-4 border-blue-600 text-blue-600 p-3 rounded">
  ℹ 정보입니다
</div>
```

---

## 자주 쓰는 패턴

### 1. 버튼 패턴

```tsx
// ✅ Primary 버튼 (권장)
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
  저장
</button>

// ✅ Secondary 버튼 (회색)
<button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 border border-gray-300 transition">
  취소
</button>

// ✅ 위험 버튼 (빨강)
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
  삭제
</button>

// ✅ 성공 버튼 (초록)
<button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
  승인
</button>
```

### 2. 카드 패턴

```tsx
// ✅ 표준 카드
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  <h2 className="text-lg font-bold text-gray-900 mb-4">제목</h2>
  <p className="text-sm text-gray-600">설명</p>
</div>

// ✅ 강조된 카드 (primary 색상)
<div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
  <h2 className="text-lg font-bold text-primary-600 mb-4">중요</h2>
  <p className="text-sm text-gray-600">내용</p>
</div>

// ✅ 에러 카드
<div className="bg-red-50 rounded-lg border border-red-200 p-6">
  <h2 className="text-lg font-bold text-red-600 mb-2">오류</h2>
  <p className="text-sm text-red-600">에러 메시지</p>
</div>
```

### 3. 입력 필드 패턴

```tsx
// ✅ 기본 입력 필드
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>

// ✅ 에러 상태 입력
<input
  type="text"
  className="w-full px-3 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500"
/>

// ✅ 비활성 입력
<input
  type="text"
  disabled
  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
/>
```

### 4. 배지 패턴

```tsx
// ✅ Primary 배지
<span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
  라벨
</span>

// ✅ 성공 배지
<span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
  완료
</span>

// ✅ 에러 배지
<span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
  오류
</span>

// ✅ Gray 배지
<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
  보류 중
</span>
```

### 5. 메시지/알림 패턴

```tsx
// ✅ 성공 알림
<div className="p-3 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
  <strong>성공!</strong> 작업이 완료되었습니다.
</div>

// ✅ 에러 알림
<div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
  <strong>오류!</strong> 작업 중 문제가 발생했습니다.
</div>

// ✅ 정보 알림 (왼쪽 테두리)
<div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-600 text-sm">
  <strong>정보</strong> 시스템이 유지보수 중입니다.
</div>

// ✅ 경고 알림
<div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-600 text-sm">
  <strong>주의</strong> 이 작업은 되돌릴 수 없습니다.
</div>
```

### 6. 테이블 패턴

```tsx
// ✅ 기본 테이블
<table className="w-full text-left text-sm">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-3 font-semibold text-gray-900">헤더</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-3 text-gray-900">데이터</td>
    </tr>
  </tbody>
</table>

// ✅ 선택된 행 강조
<tr className="bg-primary-50">
  <td className="px-6 py-3 text-gray-900">선택된 행</td>
</tr>
```

### 7. 링크 패턴

```tsx
// ✅ 기본 링크
<a href="#" className="text-primary-500 hover:text-primary-600 hover:underline">
  링크
</a>

// ✅ 비활성 링크
<a href="#" className="text-gray-400 cursor-not-allowed">
  비활성 링크
</a>

// ✅ 외부 링크
<a href="#" className="text-primary-500 hover:underline inline-flex items-center gap-1">
  외부 링크 <span>↗</span>
</a>
```

---

## 색상 선택 가이드

### 상황별 색상 선택

| 상황 | 추천 색상 | 예시 |
|------|----------|------|
| **주요 액션 버튼** | `primary-500` | 저장, 제출, 확인 |
| **버튼 호버** | `primary-600` | 마우스 올림 |
| **제목/헤더** | `gray-900` | h1, h2, h3 |
| **본문 텍스트** | `gray-900` | 단락, 본문 |
| **보조 텍스트** | `gray-600` | 설명, 캡션 |
| **배경** | `gray-50`, `gray-100` | 페이지, 섹션 |
| **테두리** | `gray-200`, `gray-300` | 카드, 입력 |
| **성공 메시지** | `green-600` (배경: `green-50`) | 완료, 승인 |
| **에러 메시지** | `red-600` (배경: `red-50`) | 오류, 실패 |
| **경고 메시지** | `yellow-600` (배경: `yellow-50`) | 주의, 삭제 확인 |
| **정보 메시지** | `blue-600` (배경: `blue-50`) | 알림, 팁 |
| **비활성 요소** | `gray-400`, `gray-500` | 비활성 버튼, 텍스트 |

### 색상 조합 규칙

```tsx
// ✅ 좋은 색상 조합

// 1. 배경 + 텍스트 (대비 좋음)
<div className="bg-red-50 text-red-600">OK</div>
<div className="bg-green-50 text-green-600">OK</div>
<div className="bg-blue-50 text-blue-600">OK</div>
<div className="bg-white text-gray-900">OK</div>

// 2. 배경 + 테두리 (구분선)
<div className="bg-gray-100 border border-gray-300">OK</div>
<div className="bg-primary-50 border border-primary-200">OK</div>

// ❌ 나쁜 색상 조합 (피할 것)

// 1. 대비 부족
<div className="bg-gray-100 text-gray-200">NO - 구분 안 됨</div>
<div className="bg-primary-50 text-primary-100">NO - 구분 안 됨</div>

// 2. 어울리지 않는 조합
<div className="bg-red-50 text-green-600">NO - 어색함</div>
<div className="bg-blue-50 text-yellow-600">NO - 어색함</div>
```

---

## 금지된 사용법

### ❌ 절대 하지 말아야 할 것

#### 1. HEX 색상 하드코딩

```tsx
// ❌ 금지된 방법
<div className="bg-[#005BAC]">NO</div>
<div className="text-[#212121]">NO</div>
<button className="bg-[#1A73E8]">NO</button>

// ✅ 올바른 방법
<div className="bg-primary-500">OK</div>
<div className="text-gray-900">OK</div>
<button className="bg-primary-500">OK</button>
```

#### 2. 인라인 스타일 사용

```tsx
// ❌ 금지된 방법
<div style={{ backgroundColor: '#005BAC' }}>NO</div>
<div style={{ color: '#212121' }}>NO</div>

// ✅ 올바른 방법
<div className="bg-primary-500">OK</div>
<div className="text-gray-900">OK</div>
```

#### 3. RGB 색상 직접 입력

```tsx
// ❌ 금지된 방법
<div className="bg-[rgb(0,91,172)]">NO</div>
<div className="text-[rgb(33,33,33)]">NO</div>

// ✅ 올바른 방법
<div className="bg-primary-500">OK</div>
<div className="text-gray-900">OK</div>
```

#### 4. Tailwind 미정의 색상값

```tsx
// ❌ 금지된 방법
<div className="text-[#6E6E6E]">NO</div>
<div className="bg-[#E8F1FB]">NO</div>

// ✅ 올바른 방법
<div className="text-gray-600">OK</div>
<div className="bg-primary-50">OK</div>
```

#### 5. CSS 파일에 색상 정의

```css
/* ❌ 금지된 방법 */
.custom-button {
  background-color: #005BAC;
  color: #ffffff;
}

/* ✅ 올바른 방법 */
/* 클래스를 만들지 말고 직접 Tailwind 클래스 사용 */
/* className="bg-primary-500 text-white" */
```

---

## 빠른 참조 (Cheat Sheet)

### 가장 자주 쓰는 색상

```tsx
// 텍스트
text-gray-900      // 기본 텍스트
text-gray-600      // 보조 텍스트
text-primary-500   // 링크, 강조

// 배경
bg-white           // 기본 배경
bg-gray-50         // 섹션 배경
bg-primary-50      // 강조 배경

// 상태
bg-green-50 text-green-600    // 성공
bg-red-50 text-red-600        // 에러
bg-yellow-50 text-yellow-600  // 경고

// 테두리
border-gray-200    // 기본 테두리
border-primary-500 // 강조 테두리
```

### 색상 조합 템플릿

```tsx
// 성공
<div className="bg-green-50 border border-green-200 rounded text-green-600">
  {message}
</div>

// 에러
<div className="bg-red-50 border border-red-200 rounded text-red-600">
  {message}
</div>

// 버튼
<button className="bg-primary-500 text-white hover:bg-primary-600">
  {label}
</button>

// 카드
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  {content}
</div>
```

---

## 추가 팁

### 1. 색상 명도 순서

```
밝은 색상  ← 50  100  200  300  400  500  600  700  800  900 → 어두운 색상
배경에 좋음                                           텍스트에 좋음
```

### 2. 접근성 (Accessibility)

텍스트와 배경의 명도 차이를 충분히 해주세요:

```tsx
// ✅ 접근성 좋음 (대비 큼)
<div className="bg-white text-gray-900">OK</div>
<div className="bg-gray-100 text-gray-900">OK</div>
<div className="bg-primary-50 text-primary-600">OK</div>

// ❌ 접근성 나쁨 (대비 적음)
<div className="bg-gray-50 text-gray-100">NO</div>
<div className="bg-primary-50 text-primary-100">NO</div>
```

### 3. 다크모드 (향후)

현재 프로젝트는 라이트모드만 지원합니다.
다크모드 추가 시 이 문서를 업데이트합니다.

---

## 색상 변경 히스토리

| 날짜 | 변경사항 | 영향 |
|------|---------|------|
| 2025-12-12 | 초기 문서 작성 | - |
| (예정) | 다크모드 추가 | primary, gray 색상 |
| (예정) | 새로운 상태 색상 추가 | status colors |

---

## 참고

- **공식 Tailwind 색상 문서:** https://tailwindcss.com/docs/customizing-colors
- **프로젝트 설정 파일:** `tailwind.config.js`
- **스타일 가이드:** [UI_UX_STYLE_GUIDE.md](UI_UX_STYLE_GUIDE.md)

---

**버전:** v1.0
**최종 업데이트:** 2025-12-12
**상태:** 🎨 정식 적용 중

# 사용자 관리 페이지 구현 작업 내역

**작업 일자:** 2025-12-21
**작업자:** Claude Code
**참조 HTML:** `docs/Ui_ref/13_사용자관리_v2.html`

---

## 📋 작업 개요

광주은행 KWH 지식관리시스템의 사용자 관리 페이지를 React + TypeScript + Tailwind CSS로 구현했습니다.
HTML 참조 파일의 UI/UX를 그대로 유지하면서 프로젝트 아키텍처에 맞게 컴포넌트화했습니다.

---

## 🎯 구현된 주요 기능

### 1. 사용자 검색 및 조회
- **5개 필터 제공**
  - 직번 (텍스트 입력)
  - 사용자 한글명 (텍스트 입력)
  - 역할 (Select: 전체/관리자/상담사/검토자)
  - 사용 여부 (Select: 전체/사용/미사용)
  - 부서명 (TypeAhead Select)
- **초기화/조회 버튼**
- **실시간 필터링** (Mock 데이터 기준)

### 2. 사용자 목록 테이블
- **6개 컬럼 표시**
  - 직번
  - 사용자 한글명
  - 역할 (Badge 표시: 관리자-빨강, 상담사-파랑, 검토자-회색)
  - 부서명
  - 사용 여부 (Badge 표시: 사용-초록, 미사용-회색)
  - 관리 (수정/삭제 버튼)
- **Hover 효과** 및 **하이라이트 기능**
- **조회 결과 건수 표시**

### 3. 사용자 신규 등록
- **모달 폼 제공**
  - 직번 * (필수)
  - 사용자 한글명 * (필수)
  - 역할 * (Select)
  - 부서 * (TypeAhead Select)
  - 비밀번호 * (필수)
  - 비밀번호 확인 * (필수, 일치 검증)
  - 사용 여부 (Toggle 스위치)
- **유효성 검사**
  - 필수 필드 체크
  - 비밀번호 일치 확인
  - 부서 선택 확인
- **성공 시 Toast 알림 + 목록 새로고침**

### 4. 사용자 삭제
- **브라우저 confirm 금지** → 커스텀 `ConfirmDialog` 사용
- **삭제 확인 다이얼로그**
  - 제목: "사용자 삭제"
  - 메시지: "정말 삭제하시겠습니까?"
  - 버튼: 취소 / 삭제 (danger variant)
- **성공 시 Toast 알림 + 목록에서 제거**

### 5. Manual ID 기반 스크롤 이동 (신규 요구사항)
- **자동 스크롤**
  - URL Query Parameter: `/admin/users?manual_id=E002`
  - 페이지 로드 시 해당 사용자 row로 자동 스크롤
  - 중복 실행 방지 (didAutoScrollRef)
- **수동 스크롤**
  - 상단 패널에 Manual ID 입력창 + "이동" 버튼
  - Enter 키 지원
- **하이라이트 효과**
  - 3초 동안 `bg-primary-50 ring-2 ring-primary-500` 적용
  - 자동 해제 (타이머 관리)
- **에러 처리**
  - 빈 값 입력 시: "Manual ID를 입력해주세요."
  - 대상 미발견 시: "해당 Manual ID를 찾을 수 없습니다. 예) E001, E002, E003, E004, E005"

### 6. Toast 알림
- **기존 ToastContext 재사용**
- **알림 종류**
  - 성공: 사용자 등록/삭제 성공
  - 에러: 삭제 실패, Manual ID 에러
  - 정보: 수정 기능 미구현 안내

---

## 📂 생성된 파일 목록

### 타입 정의
```
src/types/users.ts
```
- `UserRole`: 사용자 역할 타입
- `UserRow`: 사용자 목록 row 타입
- `UserSearchParams`: 검색 파라미터 타입
- `UserCreatePayload`: 사용자 생성 payload 타입
- `DepartmentOption`, `RoleOption`: 옵션 타입

### API 레이어
```
src/lib/api/users.ts
```
- `getUsers()`: 사용자 목록 조회 (필터링 지원)
- `createUser()`: 사용자 등록
- `deleteUser()`: 사용자 삭제
- **현재 Mock 구현** (400~500ms delay)
- **TODO 주석으로 실제 API 연결 포인트 표시**

### 커스텀 훅
```
src/hooks/useUsers.ts
```
- 사용자 목록 로딩/검색/초기화 관리
- `fetchUsers()`, `handleSearch()`, `handleReset()`, `refetch()`

```
src/hooks/useScrollToRow.ts
```
- **재사용 가능한 범용 훅**
- 스크롤/하이라이트 로직 캡슐화
- 옵션: highlightDuration, scrollBehavior, scrollBlock, onToast

### 컴포넌트
```
src/components/common/ConfirmDialog.tsx
```
- 확인 다이얼로그 (삭제 확인용)
- variant: 'danger' | 'primary'

```
src/components/admin/UserSearchPanel.tsx
```
- 검색 조건 패널 (5개 필터)
- 초기화/조회 버튼

```
src/components/admin/UserTable.tsx
```
- 사용자 목록 테이블
- ref 기반 스크롤 타겟 매핑
- 하이라이트 효과 적용

```
src/components/admin/UserRegistrationModal.tsx
```
- 신규 등록 모달
- 유효성 검사 포함
- Toggle 스위치 (사용 여부)

### 페이지
```
src/pages/admin/UserManagementPage.tsx
```
- **메인 콘텐츠 페이지** (AppLayout 내부)
- 검색 패널 + 테이블 + 모달 orchestration
- Manual ID 스크롤 로직 통합

### 라우팅
```
src/routes/AppRouter.tsx
```
- `/admin/users` 경로에 `UserManagementPage` 연결
- 기존 `AdminUsersPage` import를 `UserManagementPage`로 교체

### 사이드바
```
src/layouts/AppSidebar.tsx
```
- "사용자 관리" 메뉴 항목 추가 (관리자 섹션 최상단)

---

## 🏗️ 아키텍처 설계

### 디렉토리 구조
```
src/
├── types/
│   └── users.ts                          # 타입 정의
├── lib/api/
│   └── users.ts                          # API 레이어 (Mock)
├── hooks/
│   ├── useUsers.ts                       # 사용자 목록 관리
│   └── useScrollToRow.ts                 # 스크롤/하이라이트 (재사용)
├── components/
│   ├── common/
│   │   └── ConfirmDialog.tsx             # 확인 다이얼로그
│   └── admin/
│       ├── UserSearchPanel.tsx           # 검색 패널
│       ├── UserTable.tsx                 # 테이블
│       └── UserRegistrationModal.tsx     # 등록 모달
└── pages/admin/
    └── UserManagementPage.tsx            # 메인 페이지
```

### 데이터 흐름
```
UserManagementPage (orchestrator)
  ├─> useUsers (상태 관리)
  │     └─> lib/api/users (API 호출)
  │
  ├─> useScrollToRow (스크롤/하이라이트)
  │
  ├─> UserSearchPanel (검색 UI)
  ├─> UserTable (목록 표시)
  ├─> UserRegistrationModal (등록 폼)
  └─> ConfirmDialog (삭제 확인)
```

### 스크롤 매핑 로직
```typescript
// Row ID 규칙
id="user-row-${user.employee_id}"

// Ref 매핑
rowRefs.current[user.employee_id] = HTMLTableRowElement

// 현재 매핑: manual_id === employee_id
// TODO: 추후 실제 매핑 로직으로 교체
```

---

## 🎨 스타일링 표준 준수

### Tailwind CSS 100% 사용
- **색상 토큰만 사용** (HEX 하드코딩 금지)
  - `primary-500`, `primary-600` (광주은행 브랜드)
  - `gray-50`, `gray-100`, `gray-600`, `gray-900`
  - `red-600`, `green-600`, `blue-600` (상태 색상)
- **인라인 스타일 금지**
- **styled-components 사용 안 함**

### 주요 스타일 패턴
```typescript
// 검색 패널 / 결과 패널
className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"

// 테이블 헤더
className="bg-blue-50"

// 하이라이트 효과
className="bg-primary-50 ring-2 ring-primary-500 transition-colors"

// 버튼 (Primary)
className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"

// 버튼 (Secondary)
className="px-4 py-2 text-sm font-semibold bg-white text-primary-500 border border-primary-500 rounded-md hover:bg-primary-50 transition"

// 버튼 (Danger)
className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
```

---

## 🔗 API 연결 가이드

### 현재 상태: Mock 구현
모든 API 함수는 Mock 데이터를 반환하며, 실제 백엔드 연결 포인트에 `TODO` 주석이 표시되어 있습니다.

### 실제 API 연결 시 작업
1. **`src/lib/api/users.ts` 수정**
   ```typescript
   // TODO 주석 제거 및 실제 API 호출로 교체
   import api from './axiosClient';

   export const getUsers = async (params?: UserSearchParams): Promise<UserRow[]> => {
     const response = await api.get('/api/v1/users', { params });
     return response.data;
   };
   ```

2. **백엔드 스펙 확인**
   - Query Parameters: `employee_id`, `name`, `role`, `is_active`, `department_name`
   - Response 형식이 `UserRow[]`와 일치하는지 확인
   - 필요 시 `src/types/users.ts`에서 타입 조정

3. **에러 처리 추가**
   ```typescript
   try {
     const data = await getUsers(params);
     setUsers(data);
   } catch (error) {
     toast.error('사용자 조회에 실패했습니다.');
   }
   ```

---

## 📝 TODO 및 향후 개선사항

### 필수 TODO
- [ ] **Manual ID 매핑 로직 구현**
  - 현재: `manual_id === employee_id`
  - 변경: 실제 비즈니스 로직에 맞게 수정
  - 위치: `UserManagementPage.tsx` > `handleScrollToManualId()`

- [ ] **실제 API 연결**
  - `src/lib/api/users.ts`의 TODO 주석 참고
  - GET `/api/v1/users`
  - POST `/api/v1/users`
  - DELETE `/api/v1/users/:userId`

- [ ] **사용자 수정 기능 구현**
  - 현재: Toast 안내만 표시
  - 필요: 수정 모달 생성 (등록 모달과 유사)

### 선택적 개선사항
- [ ] **페이지네이션 추가**
  - 현재: 전체 목록 표시
  - 개선: `<Pagination />` 컴포넌트 통합

- [ ] **정렬 기능**
  - 테이블 헤더 클릭 시 정렬
  - `sort_by`, `sort_order` 파라미터 활용

- [ ] **부서 목록 API 연동**
  - 현재: 하드코딩된 목업 데이터
  - 개선: 공통코드 API에서 부서 목록 가져오기

- [ ] **권한별 접근 제어**
  - ADMIN만 사용자 관리 페이지 접근 가능
  - ProtectedRoute 적용

- [ ] **사용자 상세 보기**
  - row 클릭 시 상세 정보 모달 표시

---

## 🧪 테스트 가이드

### 수동 테스트 체크리스트

#### 1. 검색 기능
- [ ] 직번으로 검색 (부분 일치)
- [ ] 이름으로 검색 (부분 일치)
- [ ] 역할 필터 (관리자/상담사/검토자)
- [ ] 사용 여부 필터 (사용/미사용)
- [ ] 부서명 TypeAhead 검색
- [ ] 초기화 버튼 동작
- [ ] 조회 버튼 동작

#### 2. 신규 등록
- [ ] 빈 필드 유효성 검사
- [ ] 비밀번호 일치 검증
- [ ] 부서 미선택 시 에러
- [ ] Toggle 스위치 동작
- [ ] 등록 성공 시 Toast + 목록 새로고침
- [ ] 취소 버튼 (모달 닫기)

#### 3. 삭제
- [ ] 삭제 버튼 클릭 → ConfirmDialog 표시
- [ ] 취소 버튼 동작
- [ ] 삭제 확정 → Toast + 목록에서 제거

#### 4. Manual ID 스크롤
- [ ] URL 진입: `/admin/users?manual_id=E002` → 자동 스크롤
- [ ] 하이라이트 3초 표시 후 자동 해제
- [ ] 수동 입력창에서 이동 버튼 클릭
- [ ] Enter 키로 이동
- [ ] 존재하지 않는 ID 입력 시 에러 Toast
- [ ] 빈 값 입력 시 에러 Toast

#### 5. UI/UX
- [ ] Table hover 효과
- [ ] Badge 색상 (역할/사용여부)
- [ ] 모달 오버레이 클릭 시 닫기
- [ ] 반응형 (그리드 레이아웃)
- [ ] 사이드바 메뉴 활성화 표시

---

## 🚀 배포 전 체크리스트

- [ ] TypeScript 컴파일 오류 없음 (`npm run lint`)
- [ ] 모든 TODO 주석 확인 및 필요 시 처리
- [ ] API 엔드포인트 환경 변수 설정
- [ ] 실제 부서 목록 데이터로 교체
- [ ] 권한 검증 로직 추가
- [ ] 에러 핸들링 강화
- [ ] 로딩 상태 개선 (Spinner)
- [ ] 접근성(A11y) 검토

---

## 📚 참고 문서

- **프로젝트 가이드:** `CLAUDE.md`
- **스타일 가이드:** `docs/UI_UX_STYLE_GUIDE.md`
- **색상 참조:** `docs/TAILWIND_COLOR_REFERENCE.md`
- **API 명세:** `docs/openapi.json`
- **참조 HTML:** `docs/Ui_ref/13_사용자관리_v2.html`

---

## 🎉 작업 완료 요약

✅ **9개 파일 생성** (타입, API, 훅, 컴포넌트, 페이지)
✅ **2개 파일 수정** (라우팅, 사이드바)
✅ **Tailwind CSS 100% 준수**
✅ **TypeScript strict mode 준수**
✅ **재사용 가능한 훅 설계** (`useScrollToRow`)
✅ **Mock API 구현** (실제 연결 준비 완료)
✅ **프로젝트 아키텍처 준수** (AppLayout 재사용)

**접속 경로:** `/admin/users`
**Manual ID 스크롤:** `/admin/users?manual_id=E002`

---

**작성일:** 2025-12-21
**문서 버전:** 1.0

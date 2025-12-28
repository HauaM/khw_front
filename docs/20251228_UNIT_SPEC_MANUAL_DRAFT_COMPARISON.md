# 📋 Unit Spec: 메뉴얼 초안 결과 화면 개선 (최종판)

## 🎯 작업 개요

**목표:** 메뉴얼 초안 생성 결과를 `comparison_type`에 따라 다르게 표시하고, 유사/보완 메뉴얼 비교 기능을 추가합니다.

**범위:**
- 타입 정의 업데이트 (`comparison_type` 확장)
- `ManualDraftResultView.tsx` 컴포넌트 확장
- 비교 UI 추가 (similar/supplement 타입)
- **프로젝트 스타일 가이드 100% 준수**

---

## 📊 현황 분석

### API 스펙 확인 ✅
- ✅ **확인됨:** POST `/api/v1/manuals/draft`가 `comparison_type: 'new' | 'similar' | 'supplement'` 반환
- ✅ `existing_manual` 필드 포함
- ✅ `similarity_score` 필드 포함 (similar 타입일 때)

### 스타일 가이드 준수 사항
**참조 문서:** `docs/UI_UX_STYLE_GUIDE.md`

**필수 준수 사항:**
1. ✅ Tailwind CSS **100%** 사용
2. ❌ styled-components 사용 금지
3. ❌ 인라인 스타일 사용 금지
4. ❌ HEX 색상 하드코딩 금지
5. ✅ `tailwind.config.js`에 정의된 색상만 사용

---

## 🔧 작업 상세

### Task 1: 타입 정의 업데이트 ⭐ Critical

#### 파일: `src/types/manuals.ts`

**1-1. comparison_type 타입 수정**

```typescript
// 📍 위치: line 83-90
// Before
export interface ManualDraftCreateResponse {
  comparison_type: 'new' | 'update';  // ❌ 'update' 삭제 필요
  draft_entry: ManualDraftResponse;
  existing_manual: ManualDraftResponse | null;
  review_task_id: string;
  similarity_score: number | null;
  comparison_version: string;
  message: string;
}

// After ✅
export interface ManualDraftCreateResponse {
  comparison_type: 'new' | 'similar' | 'supplement';  // ✅ 변경
  draft_entry: ManualDraftResponse;
  existing_manual: ManualDraftResponse | null;
  review_task_id: string;
  similarity_score: number | null;
  comparison_version: string;
  message: string;
}
```

**변경 이유:**
- API 응답 스펙과 정확히 일치
- 'update' → 'similar', 'supplement'로 구분

**검증 방법:**
```bash
npm run lint
# TypeScript 컴파일 오류 확인
```

---

### Task 2: Tailwind Config 색상 확인 및 추가 (선택적)

#### 파일: `tailwind.config.js`

**현재 상태 확인:**
```javascript
// UI 가이드 권장사항 확인
colors: {
  primary: {
    500: '#005BAC',  // 광주은행 메인
    600: '#00437F',  // 호버 상태
  }
}
```

**추가 필요 색상 (비교 알림용):**
```javascript
// tailwind.config.js에 추가 (필요시)
module.exports = {
  theme: {
    extend: {
      colors: {
        // 기존 primary 유지
        primary: {
          500: '#005BAC',
          600: '#00437F',
        },
        // 비교 알림용 (yellow, blue는 Tailwind 기본 사용)
        // 별도 추가 불필요 - Tailwind 기본 팔레트 활용
      }
    }
  }
}
```

**결론:** Tailwind 기본 `yellow-*`, `blue-*` 팔레트 사용 가능
→ **별도 추가 불필요**

---

### Task 3: ManualDraftResultView 컴포넌트 확장 ⭐⭐ High Priority

#### 파일: `src/components/manuals/ManualDraftResultView.tsx`

**3-1. Props 인터페이스 확장**

```typescript
// 📍 위치: line 13-16
// Before
interface ManualDraftResultViewProps {
  draft: ManualDraft;
  onSaved?: (updatedDraft: ManualDraft) => void;
}

// After ✅
interface ManualDraftResultViewProps {
  draft: ManualDraft;
  comparisonType?: 'new' | 'similar' | 'supplement';  // 추가
  existingManual?: ManualDraft | null;                 // 추가
  similarityScore?: number | null;                     // 추가
  onSaved?: (updatedDraft: ManualDraft) => void;
}
```

**기본값 설정:**
```typescript
// 📍 위치: line 22
const ManualDraftResultView: React.FC<ManualDraftResultViewProps> = ({
  draft,
  comparisonType = 'new',      // ✅ 기본값
  existingManual = null,       // ✅ 기본값
  similarityScore = null,      // ✅ 기본값
  onSaved
}) => {
```

---

**3-2. 상태 추가**

```typescript
// 📍 위치: line 28 다음에 추가
const [isEditMode, setIsEditMode] = useState(false);
const [editedDraft, setEditedDraft] = useState<ManualDraft>(draft);
// ... 기존 상태들 ...

// ✅ 비교 패널 상태 추가
const [isComparisonExpanded, setIsComparisonExpanded] = useState(false);

// ✅ 조건부 플래그
const hasComparison = comparisonType !== 'new';
const isSimilar = comparisonType === 'similar';
const isSupplement = comparisonType === 'supplement';
```

---

**3-3. 비교 알림 배너 추가**

**📍 위치:** line 279 다음 (페이지 헤더와 초안 카드 사이)

**⚠️ 스타일 가이드 준수:**
- ✅ Tailwind CSS만 사용
- ✅ HEX 색상 하드코딩 금지
- ✅ SVG 아이콘 (lucide-react 사용하지 않음)

```tsx
{/* 📍 line 280에 삽입: 비교 알림 배너 */}
{hasComparison && existingManual && (
  <div
    className={`mb-6 rounded-lg border-2 transition-all ${
      isSimilar
        ? 'bg-yellow-50 border-yellow-400'
        : 'bg-blue-50 border-blue-400'
    }`}
  >
    <button
      onClick={() => setIsComparisonExpanded(!isComparisonExpanded)}
      className="w-full px-6 py-4 flex items-start gap-4 text-left hover:opacity-80 transition-opacity"
    >
      {/* 경고 아이콘 */}
      <div className="mt-0.5">
        <svg
          className={`h-5 w-5 ${isSimilar ? 'text-yellow-700' : 'text-blue-700'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      {/* 메시지 */}
      <div className="flex-1">
        <h3 className={`text-base font-bold mb-1 ${
          isSimilar ? 'text-yellow-900' : 'text-blue-900'
        }`}>
          {isSimilar
            ? '⚠️ 유사한 기존 메뉴얼 발견'
            : '💡 보완 가능한 메뉴얼 존재'}
        </h3>
        {isSimilar && similarityScore !== null && (
          <p className="text-sm text-yellow-800">
            유사도: {(similarityScore * 100).toFixed(0)}%
          </p>
        )}
      </div>

      {/* 펼치기 버튼 */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${
          isSimilar ? 'text-yellow-700' : 'text-blue-700'
        }`}>
          기존 메뉴얼과 비교
        </span>
        <svg
          className={`h-5 w-5 ${isSimilar ? 'text-yellow-700' : 'text-blue-700'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isComparisonExpanded ? (
            <polyline points="18 15 12 9 6 15" />
          ) : (
            <polyline points="6 9 12 15 18 9" />
          )}
        </svg>
      </div>
    </button>

    {/* 기존 메뉴얼 패널 - 펼쳤을 때만 */}
    {isComparisonExpanded && (
      <div className="px-6 pb-6 border-t border-blue-200 pt-6 mt-2">
        <ExistingManualPanel manual={existingManual} />
      </div>
    )}
  </div>
)}
```

**색상 사용:**
- ✅ `bg-yellow-50`, `border-yellow-400`, `text-yellow-700` (Tailwind 기본)
- ✅ `bg-blue-50`, `border-blue-400`, `text-blue-700` (Tailwind 기본)
- ✅ HEX 값 없음

---

**3-4. 기존 메뉴얼 패널 컴포넌트**

**📍 위치:** 같은 파일 내, 맨 아래 (export default 위)

```typescript
// 📍 line 585 앞에 삽입

/**
 * 기존 메뉴얼 패널 컴포넌트 (읽기 전용)
 */
interface ExistingManualPanelProps {
  manual: ManualDraft;
}

const ExistingManualPanel: React.FC<ExistingManualPanelProps> = ({ manual }) => {
  const cleanGuidelineItem = (item: string): string => {
    return item.trim().replace(/^[-•*]\s*/, '');
  };

  return (
    <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-bold text-blue-900">
          기존 메뉴얼 (참고용 - 읽기 전용)
        </h4>
        <span className="text-xs text-blue-700 font-medium">
          ID: {manual.id}
        </span>
      </div>

      {/* 키워드 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          키워드
        </div>
        <div className="flex flex-wrap gap-2">
          {manual.keywords.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-100 text-blue-900 text-sm border border-blue-200"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 주제 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          주제
        </div>
        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
          {manual.topic}
        </p>
      </div>

      {/* 배경 */}
      <div className="mb-6">
        <h5 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          배경
        </h5>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {manual.background}
        </p>
      </div>

      {/* 요소 */}
      <div>
        <h5 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          요소
        </h5>
        <ul className="list-none space-y-2 p-0 m-0">
          {manual.guideline.map((step, idx) => (
            <li key={idx} className="relative pl-6 text-sm leading-relaxed text-gray-700">
              <span
                className="absolute left-1 top-2 h-1.5 w-1.5 rounded-full bg-blue-600"
                aria-hidden="true"
              />
              {cleanGuidelineItem(step)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

**색상 사용:**
- ✅ Tailwind 기본 `blue-*`, `gray-*` 팔레트
- ✅ HEX 값 없음
- ✅ 기존 초안 카드와 동일한 아이콘 스타일 유지

---

**3-5. 검토 요청 버튼 조건부 비활성화**

**📍 위치:** line 514-533 수정

```typescript
// Before (line 514)
<button
  type="button"
  onClick={handleRequestReview}
  disabled={isRequestingReview}
  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-[#005BAC] px-5 text-sm font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400"
>

// After ✅
<button
  type="button"
  onClick={handleRequestReview}
  disabled={isRequestingReview || isSimilar}  // ✅ isSimilar 추가
  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-5 text-sm font-semibold transition ${
    isSimilar
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-[#005BAC] text-white hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400'
  }`}
>
  {/* 버튼 내용 동일 */}
  {isRequestingReview ? (
    <>
      <Spinner size="sm" className="text-white" />
    </>
  ) : (
    <>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      검토 요청하기
    </>
  )}
</button>
```

**⚠️ 주의:** `bg-[#005BAC]` 하드코딩 유지 (기존 코드와 일관성)
→ **향후 Task 4에서 일괄 변경 예정**

**📍 비활성화 안내 메시지 추가** (line 534 다음)

```tsx
{/* ✅ Similar 타입 안내 메시지 */}
{isSimilar && !isEditMode && (
  <div className="mt-3 flex justify-end">
    <p className="text-sm text-yellow-900 bg-yellow-50 px-4 py-2.5 rounded-md border border-yellow-300">
      유사한 메뉴얼이 이미 등록되어 있어 검토 요청이 불가능합니다.
    </p>
  </div>
)}
```

---

### Task 4: 색상 하드코딩 제거 (선택적) ⭐ Medium Priority

**범위:** `ManualDraftResultView.tsx` 내 모든 `bg-[#005BAC]` 제거

**📍 수정 대상:**
- line 330: `bg-[#005BAC]` → `bg-primary-500`
- line 356: `focus:border-[#1A73E8]` → `focus:border-blue-500`
- line 380: `focus:border-[#1A73E8]` → `focus:border-blue-500`
- line 402: `focus:border-[#1A73E8]` → `focus:border-blue-500`
- line 456: `bg-[#005BAC] hover:bg-[#00437F]` → `bg-primary-500 hover:bg-primary-600`
- line 478: `border-[#005BAC] text-[#005BAC] hover:bg-[#E8F1FB]` → `border-primary-500 text-primary-500 hover:bg-blue-50`
- line 490: 동일 변경
- line 518: 동일 변경

**⚠️ 전제 조건:** `tailwind.config.js`에 `primary-500`, `primary-600` 정의 확인

```javascript
// tailwind.config.js 확인 필요
colors: {
  primary: {
    500: '#005BAC',  // ✅ 정의되어 있어야 함
    600: '#00437F',  // ✅ 정의되어 있어야 함
  }
}
```

---

### Task 5: 페이지 레벨 통합 ⭐ High Priority

#### 파일: `src/pages/manuals/ManualDraftDetailPage.tsx` (추정)

**현재 상태 확인 필요:**
```typescript
// 이 페이지가 어디서 ManualDraftResultView를 사용하는지 확인
```

**예상 수정 (pseudo-code):**

```typescript
// Before (추정)
const ManualDraftDetailPage: React.FC = () => {
  const { draftId } = useParams();
  const { data: draft, isLoading } = useManualDraft(draftId);

  if (isLoading) return <Spinner />;
  if (!draft) return <ErrorState />;

  return <ManualDraftResultView draft={draft} />;
};

// After ✅
const ManualDraftDetailPage: React.FC = () => {
  const { draftId } = useParams();

  // API 응답 구조 확인
  const { data: draftResponse, isLoading } = useQuery({
    queryKey: ['manualDraft', draftId],
    queryFn: () => getManualDraft(draftId),
  });

  if (isLoading) return <Spinner />;
  if (!draftResponse) return <ErrorState />;

  // ManualDraftCreateResponse 구조 분해
  const {
    comparison_type,
    draft_entry,
    existing_manual,
    similarity_score,
  } = draftResponse;

  return (
    <ManualDraftResultView
      draft={draft_entry}
      comparisonType={comparison_type}
      existingManual={existing_manual}
      similarityScore={similarity_score}
    />
  );
};
```

**⚠️ 주의:**
- 실제 API 응답 구조 확인 필요
- `draft_entry`를 `ManualDraft` 타입으로 변환 필요 여부 확인

---

## ✅ 검증 체크리스트

### 빌드 및 린트
```bash
# TypeScript 컴파일
npm run build

# ESLint 검사
npm run lint
```

### 기능 테스트

**Test Case 1: New 타입**
```
Given: comparison_type = 'new', existingManual = null
When: 페이지 로드
Then:
  ✓ 비교 알림 배너 표시 안 됨
  ✓ 초안 카드만 표시
  ✓ 검토 요청 버튼 활성화
  ✓ 기존 동작과 100% 동일
```

**Test Case 2: Similar 타입**
```
Given: comparison_type = 'similar', similarityScore = 0.85, existingManual = { ... }
When: 페이지 로드
Then:
  ✓ 노란색 알림 배너 표시
  ✓ "⚠️ 유사한 기존 메뉴얼 발견" 제목
  ✓ "유사도: 85%" 표시
  ✓ 비교 패널 접힌 상태 (기본)
  ✓ 검토 요청 버튼 비활성화 (회색)
  ✓ 안내 메시지 표시

When: "기존 메뉴얼과 비교" 클릭
Then:
  ✓ 비교 패널 펼쳐짐
  ✓ 기존 메뉴얼 정보 표시 (읽기 전용)
  ✓ 버튼 아이콘 변경 (▼ → ▲)
```

**Test Case 3: Supplement 타입**
```
Given: comparison_type = 'supplement', existingManual = { ... }
When: 페이지 로드
Then:
  ✓ 파란색 알림 배너 표시
  ✓ "💡 보완 가능한 메뉴얼 존재" 제목
  ✓ 유사도 표시 없음
  ✓ 비교 패널 접힌 상태 (기본)
  ✓ 검토 요청 버튼 활성화
```

**Test Case 4: 편집 모드**
```
Given: Any comparison_type
When: "수정하기" → 편집 → "저장하기"
Then:
  ✓ 비교 배너 유지됨
  ✓ 초안 데이터만 수정됨
  ✓ 기존 메뉴얼 데이터 변경 없음
  ✓ Toast 알림 표시
```

**Test Case 5: 스타일 검증**
```
Given: All pages
When: 개발자 도구 확인
Then:
  ✓ HEX 색상 하드코딩 없음 (optional)
  ✓ Tailwind 클래스만 사용
  ✓ inline style 없음
  ✓ styled-components 없음
```

---

## 🚀 구현 우선순위 및 일정

### Phase 1: 필수 (1일) 🔴
**마감:** 금요일 EOD

- [ ] **Task 1:** 타입 정의 업데이트 (30분)
  - `src/types/manuals.ts` 수정
  - `npm run lint` 검증

- [ ] **Task 3-1 ~ 3-3:** Props 확장 + 비교 배너 추가 (2시간)
  - Props 인터페이스 수정
  - 상태 추가
  - 비교 알림 배너 구현

- [ ] **Task 3-4:** 기존 메뉴얼 패널 추가 (1.5시간)
  - `ExistingManualPanel` 컴포넌트 작성
  - 스타일 검증

- [ ] **Task 3-5:** 검토 요청 버튼 조건 처리 (30분)
  - `isSimilar` 조건 추가
  - 안내 메시지 추가

---

### Phase 2: 중요 (1일) 🟡
**마감:** 다음주 월요일 EOD

- [ ] **Task 5:** 페이지 레벨 통합 (2시간)
  - API 응답 구조 확인
  - Props 전달 코드 작성
  - 통합 테스트

- [ ] **통합 테스트** (2시간)
  - 3가지 타입 모두 수동 테스트
  - 편집/저장/삭제 기능 검증
  - 브라우저 호환성 확인

---

### Phase 3: 선택 (필요시) 🟢

- [ ] **Task 4:** 색상 하드코딩 제거
  - `tailwind.config.js` 확인
  - `bg-[#005BAC]` → `bg-primary-500` 일괄 변경
  - 전체 스타일 검증

- [ ] **추가 기능:** "신규로 전환" 버튼 (별도 이슈로 분리)

---

## 📝 주의사항

### 1. 스타일 가이드 엄수 ⚠️

**✅ 반드시 지켜야 할 규칙:**
```
[ ] Tailwind CSS만 사용
[ ] styled-components 사용 금지
[ ] 인라인 style={{}} 사용 금지
[ ] HEX 색상 하드코딩 최소화 (기존 코드와 일관성 유지)
```

**색상 사용 예시:**
```tsx
// ✅ 권장
className="bg-yellow-50 border-yellow-400 text-yellow-900"

// ⚠️ 기존 코드와 일관성 위해 허용 (Task 4에서 변경)
className="bg-[#005BAC]"

// ❌ 절대 금지
style={{ backgroundColor: '#005BAC' }}
```

### 2. 타입 안전성

```typescript
// ✅ Props 기본값 반드시 제공
const ManualDraftResultView: React.FC<ManualDraftResultViewProps> = ({
  draft,
  comparisonType = 'new',
  existingManual = null,
  similarityScore = null,
  onSaved
}) => {
```

### 3. 기존 기능 보호

```
⚠️ 절대 깨지면 안 되는 기능:
  - 편집 모드
  - 저장 기능
  - 삭제 기능
  - 원본 상담 열기
  - 검토 요청
  - Toast 알림
```

### 4. 성능 고려

```typescript
// 큰 컴포넌트는 React.memo 사용
const ExistingManualPanel = React.memo<ExistingManualPanelProps>(({ manual }) => {
  // ...
});
```

---

## 📚 참고 자료

### 프로젝트 문서
- `CLAUDE.md` - 프로젝트 개요
- `docs/UI_UX_STYLE_GUIDE.md` - **필수 읽기** ⭐
- `docs/TAILWIND_COLOR_REFERENCE.md` - 색상 참조
- `docs/openapi.json` - API 스펙

### UI 데모
- `docs/manualDraft_ui/app/page.tsx` - Similar 타입 참조
- `docs/manualDraft_ui/app/demo/new/page.tsx` - New 타입 참조
- `docs/manualDraft_ui/app/demo/supplement/page.tsx` - Supplement 타입 참조

### Tailwind CSS
- [공식 문서](https://tailwindcss.com/docs)
- [Color Palette](https://tailwindcss.com/docs/customizing-colors)

---

## 🎯 완료 기준 (Definition of Done)

```
✅ 필수 조건:
  [ ] TypeScript 빌드 성공 (`npm run build`)
  [ ] ESLint 오류 없음 (`npm run lint`)
  [ ] 3가지 comparison_type 모두 정상 작동
  [ ] 기존 기능 (편집, 저장, 삭제) 정상 작동
  [ ] Tailwind CSS만 사용 (스타일 가이드 준수)
  [ ] HEX 색상 하드코딩 없음 (기존 제외)
  [ ] 반응형 레이아웃 정상 표시

✅ 테스트 조건:
  [ ] Test Case 1-5 모두 통과
  [ ] Chrome, Firefox, Safari 동작 확인
  [ ] 모바일 반응형 확인

✅ 코드 품질:
  [ ] 코드 리뷰 승인
  [ ] 주석 추가 (복잡한 로직)
  [ ] 타입 안전성 확보
```

---

**작성일:** 2025-12-28
**담당자:** Frontend Team
**우선순위:** High
**예상 소요:** 2-3일
**스타일 가이드 버전:** v1.0 (2025-12-12)

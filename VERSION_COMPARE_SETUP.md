# 메뉴얼 버전 비교 기능 - 완전 가이드

## 📋 프로젝트 상태

메뉴얼 버전 비교 기능이 완전히 구현되었습니다. 현재 **Mock 데이터**로 동작하며, **백엔드 API와 연계하기만 하면** 실제 데이터로 동작합니다.

---

## 🎯 주요 기능

### 메뉴얼 버전 비교 페이지
- **경로**: `/manuals/:manualId/versions/compare`
- **쿼리**: `?old=v2.0&new=v2.1` (선택사항)
- **기능**:
  - 두 버전을 좌우로 나열
  - 주제, 키워드, 배경 정보, 조치사항 비교
  - 추가/삭제/수정 항목 시각적 표시
  - 버전 드롭다운 선택으로 동적 비교
  - 로딩/에러 상태 처리

---

## 📁 구현된 파일 구조

```
src/
├── types/
│   └── manuals.ts                          # 타입 정의 추가
│       ├── ManualVersionInfo
│       ├── ManualVersionDetail
│       └── ChangeFlag
├── lib/
│   ├── api/
│   │   └── manuals.ts                      # API 함수 추가
│   │       ├── getManualVersions()
│   │       └── getManualVersionDetail()
│   └── utils/
│       └── dateFormatter.ts                # 날짜 포맷팅 유틸
├── hooks/
│   └── useManualVersionCompare.ts          # 비교 로직 및 상태 관리
├── components/
│   └── manuals/
│       └── ManualVersionCompareView.tsx    # UI 컴포넌트
├── pages/
│   └── manuals/
│       └── ManualVersionComparePage.tsx    # 페이지 컴포넌트
└── routes/
    └── AppRouter.tsx                       # 라우트 추가
```

---

## 🔧 API 연동 방법

### 현재 상태 (Mock 데이터)

```typescript
// useManualVersionCompare.ts
try {
  const versionList = await getManualVersions(manualId);
} catch (apiErr) {
  // API 실패 시 mock 데이터 사용
  versionList = mockVersions;
}
```

### 백엔드 API 준비되면

Mock 데이터 부분을 자동으로 스킵하고 실제 API를 사용합니다. **별도의 코드 수정이 불필요합니다.**

---

## 🚀 백엔드 구현 필수 사항

### API 1: 버전 목록 조회

```http
GET /api/v1/manuals/{manual_id}/versions
```

**응답 예시:**
```json
[
  {
    "value": "v2.1",
    "label": "v2.1 (현재 버전)",
    "date": "2024-01-15"
  },
  {
    "value": "v2.0",
    "label": "v2.0",
    "date": "2024-01-01"
  }
]
```

**백엔드 체크리스트:**
- [ ] 엔드포인트 구현
- [ ] 버전을 최신순으로 정렬
- [ ] 첫 번째 항목에 "(현재 버전)" 추가
- [ ] 날짜를 YYYY-MM-DD 형식으로 변환

---

### API 2: 버전 상세 조회

```http
GET /api/v1/manuals/{manual_id}/versions/{version}
```

**응답 예시:**
```json
{
  "manual_id": "uuid",
  "version": "v2.1",
  "topic": "인터넷뱅킹 로그인 오류 처리 가이드",
  "keywords": ["인터넷뱅킹", "로그인오류"],
  "background": "고객이 인터넷뱅킹 로그인 시 오류가 발생하는 경우는...",
  "guidelines": [
    {
      "title": "계정 상태 확인",
      "description": "고객의 아이디를 확인하여..."
    },
    {
      "title": "브라우저 점검",
      "description": "고객이 사용 중인 브라우저 버전을 확인하고..."
    }
  ],
  "status": "APPROVED",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**백엔드 체크리스트:**
- [ ] 엔드포인트 구현
- [ ] Guideline 문자열을 배열로 파싱
  - 입력: `"제목1\n설명1\n제목2\n설명2"`
  - 출력: `[{"title":"제목1","description":"설명1"},...]`
- [ ] 필드명 정확성 (guidelines, 복수형)
- [ ] ISO 8601 datetime 반환

---

## 📊 흐름도

```
사용자 접근
  ↓
GET /manuals/:manualId/versions/compare
  ↓
API: GET /api/v1/manuals/{manualId}/versions
  ↓
버전 목록 표시 (드롭다운)
  ↓
사용자가 이전/최신 버전 선택
  ↓
API: GET /api/v1/manuals/{manualId}/versions/{version} × 2 (병렬)
  ↓
두 버전 데이터 비교
  ↓
좌우 컬럼에 비교 결과 표시
```

---

## 🎨 UI/UX

### 레이아웃
- **헤더**: Breadcrumb + "돌아가기" 버튼
- **선택 섹션**: 이전/최신 버전 드롭다운
- **범례**: 추가/삭제/수정 표시 범례
- **비교 그리드**: 2열 (이전 버전 | 최신 버전)

### 색상 코드
- **추가됨 (ADDED)**: 초록색 (`bg-green-100`)
- **삭제됨 (REMOVED)**: 빨간색 (`bg-red-100`) + 취소선
- **수정됨 (MODIFIED)**: 주황색 (`bg-orange-50`)
- **변경 없음**: 회색 (`bg-gray-50`)

---

## 🧪 테스트

### 로컬 테스트 (Mock 데이터)

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저에서 접근
http://localhost:5173/manuals/test-id/versions/compare

# 3. Mock 데이터로 버전 비교 화면 확인
```

### API 연동 후 테스트

```bash
# 1. 백엔드 API 확인
curl -X GET "http://localhost:8000/api/v1/manuals/{manual_id}/versions"

# 2. 버전 목록 확인
curl -X GET "http://localhost:8000/api/v1/manuals/{manual_id}/versions/v2.1"

# 3. 프론트엔드 테스트
http://localhost:5173/manuals/{manual_id}/versions/compare
```

---

## 🔍 디버깅

### 콘솔 로그 확인

```typescript
// 버전 목록 로드 실패
console.warn('Version API not available, using mock data:', apiErr);

// 버전 데이터 로드 실패
console.warn('Version detail API not available, using mock data:', apiErr);

// 에러 발생
console.error('Error loading versions:', err);
```

### 네트워크 탭 확인

브라우저 DevTools → Network 탭에서:
- `GET /api/v1/manuals/{manualId}/versions` 요청 확인
- `GET /api/v1/manuals/{manualId}/versions/{version}` 요청 확인
- 응답 상태 코드 (200, 404 등) 확인
- 응답 데이터 형식 확인

---

## ⚡ 성능 최적화

### 현재 구현
- **병렬 로딩**: 두 버전 데이터를 `Promise.all`로 동시에 로드
- **메모이제이션**: React 내장 최적화
- **지연 로딩**: 필요한 시점에만 데이터 로드

### 권장 사항
- 버전 목록은 캐싱 고려
- 긴 guideline 텍스트는 잘라내기 고려
- 가상 스크롤링 (많은 가이드라인의 경우)

---

## 📚 관련 문서

- **`BACKEND_API_GUIDE.md`**: 백엔드 구현 가이드 (상세)
- **`API_TYPE_MAPPING.md`**: OpenAPI ↔ TypeScript 타입 매핑
- **`src/types/manuals.ts`**: 타입 정의
- **`src/lib/api/manuals.ts`**: API 함수 및 주석

---

## 🆘 문제 해결

### "API not available" 경고가 계속 나옵니다

**원인**: 백엔드 API가 준비되지 않음
**해결**: 백엔드 API 구현 후 자동으로 해결됨

### 버전 데이터가 표시되지 않습니다

**확인 사항**:
1. 브라우저 콘솔에서 에러 확인
2. Network 탭에서 API 응답 확인
3. 응답 데이터 형식 확인 (`ManualVersionDetail`)

### Guideline이 배열이 아닙니다

**원인**: 백엔드에서 guideline 문자열을 파싱하지 않음
**해결**: API_TYPE_MAPPING.md의 Guideline 파싱 알고리즘 참고

---

## 📞 연락처

- **프론트엔드**: 현재 구현 완료
- **백엔드**: `BACKEND_API_GUIDE.md` 참고하여 구현 필요

---

## ✅ 체크리스트

### 프론트엔드 (완료)
- [x] 페이지 컴포넌트 구현
- [x] UI 컴포넌트 구현
- [x] 로직 훅 구현
- [x] 라우터 설정
- [x] Mock 데이터 구현
- [x] 타입 정의
- [x] 에러 처리
- [x] 로딩 상태 처리

### 백엔드 (대기 중)
- [ ] `GET /api/v1/manuals/{manual_id}/versions` 엔드포인트 구현
- [ ] `GET /api/v1/manuals/{manual_id}/versions/{version}` 엔드포인트 구현
- [ ] Guideline 파싱 로직 구현
- [ ] 응답 데이터 형식 검증
- [ ] 에러 처리 구현
- [ ] 테스트 완료

### 통합 테스트
- [ ] API 연동 확인
- [ ] 데이터 표시 확인
- [ ] 비교 기능 확인
- [ ] 에러 처리 확인
- [ ] 성능 테스트

---

## 🎓 참고 자료

- **OpenAPI 스펙**: `docs/openapi.json`
- **Tailwind CSS**: 모든 스타일이 Tailwind로 구성됨
- **React Router**: 경로 관리
- **TypeScript**: 타입 안정성 보장

---

마지막 업데이트: 2024년
상태: 프론트엔드 완료, 백엔드 대기 중

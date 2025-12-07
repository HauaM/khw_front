# 메뉴얼 버전 비교 기능 - 빠른 참고 가이드

**목적**: 개발자를 위한 빠른 참고 자료
**대상**: 프론트엔드 개발자, 백엔드 개발자, QA

---

## 🚀 빠른 시작

### 프론트엔드 개발자

```bash
# 개발 서버 실행
npm run dev

# 버전 비교 페이지 접근
http://localhost:5173/manuals/{manual_id}/versions/compare

# 쿼리 파라미터로 버전 지정 (선택사항)
http://localhost:5173/manuals/{manual_id}/versions/compare?old=v2.0&new=v2.1
```

### 백엔드 개발자

```bash
# API 1: 버전 목록 조회
GET http://localhost:8000/api/v1/manuals/{manual_id}/versions

# API 2: 버전 상세 조회
GET http://localhost:8000/api/v1/manuals/{manual_id}/versions/{version}
```

---

## 📁 핵심 파일 위치

| 파일 | 용도 | 경로 |
|------|------|------|
| **타입 정의** | TypeScript 인터페이스 | `src/types/manuals.ts` |
| **API 함수** | axios 호출 | `src/lib/api/manuals.ts` |
| **훅** | 비즈니스 로직 | `src/hooks/useManualVersionCompare.ts` |
| **UI 컴포넌트** | React 컴포넌트 | `src/components/manuals/ManualVersionCompareView.tsx` |
| **페이지** | 라우트 페이지 | `src/pages/manuals/ManualVersionComparePage.tsx` |
| **라우터** | 경로 설정 | `src/routes/AppRouter.tsx` |

---

## 📋 API 엔드포인트

### 1️⃣ 버전 목록 조회

```http
GET /api/v1/manuals/{manual_id}/versions
```

**응답 예시**:
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

**구현 포인트**:
- ✅ 최신순 정렬 (내림차순)
- ✅ 첫 번째에만 "(현재 버전)" 추가
- ✅ 날짜는 YYYY-MM-DD 형식

### 2️⃣ 버전 상세 조회

```http
GET /api/v1/manuals/{manual_id}/versions/{version}
```

**응답 예시**:
```json
{
  "manual_id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "v2.1",
  "topic": "인터넷뱅킹 로그인 오류 처리 가이드",
  "keywords": ["인터넷뱅킹", "로그인오류"],
  "background": "...",
  "guidelines": [
    {
      "title": "계정 상태 확인",
      "description": "고객의 아이디를..."
    }
  ],
  "status": "APPROVED",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**구현 포인트**:
- ✅ `guidelines`는 배열 (문자열 아님!)
- ✅ 각 항목에 `title`, `description` 필수
- ✅ `status`는 "APPROVED" 또는 "DEPRECATED"
- ✅ `updated_at`는 ISO 8601 형식

---

## 🔌 API 연동 상태

### 현재 상태 (프론트엔드 준비 완료)

```typescript
// src/hooks/useManualVersionCompare.ts
try {
  versionList = await getManualVersions(manualId);
} catch (apiErr) {
  console.warn('Version API not available, using mock data:', apiErr);
  versionList = mockVersions;  // ← 자동 폴백
}
```

**특징**:
- ✅ Mock 데이터로 개발/테스트 가능
- ✅ API 준비되면 자동으로 전환
- ✅ 추가 코드 수정 불필요

### 백엔드 API 준비 후

1. 백엔드팀이 두 API 엔드포인트 구현
2. 프론트엔드는 자동으로 API 호출로 전환
3. Mock 데이터 폴백은 여전히 유효 (에러 시 사용)

---

## 🎨 변경사항 색상 코딩

| 상태 | 색상 | 예시 | 의미 |
|------|------|------|------|
| **ADDED** | 초록색 | 🟢 | 새로 추가된 항목 |
| **REMOVED** | 빨간색 | 🔴 | 삭제된 항목 |
| **MODIFIED** | 주황색 | 🟠 | 수정된 항목 |
| **없음** | 회색 | ⚪ | 변경 없음 |

**표시 방식**:
- 키워드: 배경색 + 텍스트색
- 가이드라인: 왼쪽 테두리 + 배경색

---

## 🧪 개발 팁

### 1. Mock 데이터 추가

```typescript
// src/hooks/useManualVersionCompare.ts
const mockManualVersions: Record<string, ManualVersionDetail> = {
  'v3.0': {
    // 추가 테스트 데이터...
  }
};
```

### 2. 새로운 버전 필드 추가

**1단계**: 타입 정의 업데이트
```typescript
// src/types/manuals.ts
export interface ManualVersionDetail {
  // ... 기존 필드
  newField?: string;  // 새 필드 추가
}
```

**2단계**: API 응답 처리
```typescript
// src/lib/api/manuals.ts
// API 함수 업데이트 안 함 (자동으로 처리됨)
```

**3단계**: UI 컴포넌트 업데이트
```typescript
// src/components/manuals/ManualVersionCompareView.tsx
<div>
  <h4>새 필드</h4>
  <p>{oldData.newField}</p>
</div>
```

### 3. 에러 처리 개선

```typescript
// src/hooks/useManualVersionCompare.ts에서
catch (apiErr) {
  console.error('Detailed error:', {
    message: apiErr.message,
    status: apiErr.status,
    data: apiErr.data
  });

  // Mock 데이터로 폴백
  versionList = mockVersions;
}
```

---

## 🔍 디버깅 가이드

### 콘솔 로그 확인

```
✅ 정상: 없음 (API 정상 작동)
⚠️ 경고: "Version API not available" (API 미준비, mock 사용 중)
❌ 에러: "Error loading versions" (심각한 오류)
```

### Network 탭 확인

1. DevTools → Network 탭 열기
2. 새로고침
3. 다음 요청 확인:
   - `GET /api/v1/manuals/{manualId}/versions` (상태: 200)
   - `GET /api/v1/manuals/{manualId}/versions/v2.0` (상태: 200)
   - `GET /api/v1/manuals/{manualId}/versions/v2.1` (상태: 200)

### 응답 데이터 검증

```javascript
// 브라우저 콘솔에서 실행
fetch('/api/v1/manuals/{manual_id}/versions')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
```

---

## 📊 타입 매핑

### OpenAPI → 프론트엔드

```typescript
// API 응답
{
  "version": "v2.1",           // ← OpenAPI
  "approved_at": "2024-01-15T14:30:00Z"
}

// 프론트엔드 타입
{
  "value": "v2.1",             // ← version
  "date": "2024-01-15"         // ← approved_at (YYYY-MM-DD로 변환)
}
```

### Guideline 파싱

```
OpenAPI (문자열):
"guideline": "제목1\n설명1\n제목2\n설명2"

프론트엔드 (배열):
"guidelines": [
  { "title": "제목1", "description": "설명1" },
  { "title": "제목2", "description": "설명2" }
]
```

---

## ✅ 체크리스트

### 개발 시작 전
- [ ] 백엔드팀과 API 스펙 확인
- [ ] BACKEND_API_GUIDE.md 읽기
- [ ] API_TYPE_MAPPING.md 읽기

### 개발 중
- [ ] 타입 정의 확인 (src/types/manuals.ts)
- [ ] API 함수 확인 (src/lib/api/manuals.ts)
- [ ] Mock 데이터로 테스트
- [ ] 콘솔 에러 없는지 확인

### 테스트 전
- [ ] INTEGRATION_TEST_CHECKLIST.md 확인
- [ ] 모든 API 요청 상태 확인 (200 OK)
- [ ] 데이터 형식 검증
- [ ] 색상 표시 정확성 확인

### 배포 전
- [ ] 모든 테스트 통과
- [ ] Mock 데이터 폴백 테스트 (API 다운 상태)
- [ ] 에러 메시지 정확성 확인
- [ ] 성능 테스트

---

## 📞 연락처

**문의 사항**:
- 프론트엔드 구현: `src/components/manuals/`
- API 연동: `src/lib/api/manuals.ts`
- 타입 정의: `src/types/manuals.ts`
- 백엔드 스펙: `BACKEND_API_GUIDE.md`

**문서**:
- 전체 상태: `INTEGRATION_COMPLETE.md`
- 테스트: `INTEGRATION_TEST_CHECKLIST.md`
- 타입 매핑: `API_TYPE_MAPPING.md`
- OpenAPI: `docs/openapi.json`

---

## 🎓 예제 코드

### 프론트엔드에서 수동으로 API 호출

```typescript
import { getManualVersions, getManualVersionDetail } from '@/lib/api/manuals';

// 버전 목록 조회
const versions = await getManualVersions('manual-id-123');
console.log(versions);  // ManualVersionInfo[]

// 버전 상세 조회
const detail = await getManualVersionDetail('manual-id-123', 'v2.1');
console.log(detail);  // ManualVersionDetail
```

### 백엔드에서 응답 구성 (Python 예시)

```python
from fastapi import APIRouter, Path
from datetime import datetime

router = APIRouter()

@router.get("/api/v1/manuals/{manual_id}/versions")
async def get_manual_versions(manual_id: str):
    # 버전 목록 조회 (최신순)
    versions = db.get_versions_for_manual(manual_id)

    return [
        {
            "value": v.version,
            "label": f"{v.version} (현재 버전)" if i == 0 else v.version,
            "date": v.approved_at.strftime("%Y-%m-%d")
        }
        for i, v in enumerate(versions)
    ]

@router.get("/api/v1/manuals/{manual_id}/versions/{version}")
async def get_manual_version_detail(
    manual_id: str = Path(...),
    version: str = Path(...)
):
    # 버전 상세 조회
    manual = db.get_manual_by_version(manual_id, version)

    # Guideline 파싱 (문자열 → 배열)
    guidelines = []
    lines = manual.guideline.split('\n')
    for i in range(0, len(lines), 2):
        if i + 1 < len(lines):
            guidelines.append({
                "title": lines[i].strip(),
                "description": lines[i + 1].strip()
            })

    return {
        "manual_id": manual.id,
        "version": version,
        "topic": manual.topic,
        "keywords": manual.keywords,
        "background": manual.background,
        "guidelines": guidelines,
        "status": manual.status,
        "updated_at": manual.updated_at.isoformat()
    }
```

---

**마지막 업데이트**: 2025년 1월
**상태**: ✅ 프론트엔드 연동 완료

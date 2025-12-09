# API 타입 매핑 가이드

## OpenAPI ↔ 프론트엔드 TypeScript 타입 변환

### 1. 버전 목록 응답 타입

#### OpenAPI 스펙 (기존)
```json
// ManualVersionResponse[]
[
  {
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    "id": "uuid",
    "version": "v2.1",
    "description": "2차 인증 문제 해결 추가",
    "changelog": { ... }
  }
]
```

#### 프론트엔드 요청 타입
```typescript
// ManualVersionInfo (프론트)
[
  {
    "value": "v2.1",           // ← version
    "label": "v2.1 (현재 버전)", // ← 프론트에서 생성
    "date": "2024-01-15"       // ← approved_at을 YYYY-MM-DD로 변환
  }
]
```

#### 백엔드 변환 로직 (Python 예시)

```python
from datetime import datetime
from typing import List, Dict

def convert_versions_to_frontend(
    versions: List[ManualVersionResponse],
) -> List[ManualVersionInfo]:
    """OpenAPI의 ManualVersionResponse를 프론트엔드 타입으로 변환"""
    result = []

    for i, version in enumerate(versions):
        # approved_at을 YYYY-MM-DD로 변환
        date_obj = version.approved_at
        formatted_date = date_obj.strftime("%Y-%m-%d")

        # 첫 번째(최신) 버전에만 "(현재 버전)" 추가
        label = version.version
        if i == 0:
            label = f"{version.version} (현재 버전)"

        result.append({
            "value": version.version,
            "label": label,
            "date": formatted_date
        })

    return result
```

---

### 2. 버전 상세 정보 응답 타입

#### OpenAPI 스펙 (기존)
```json
// ManualEntryResponse
{
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "id": "uuid",
  "keywords": ["키워드1", "키워드2"],
  "topic": "메뉴얼 제목",
  "background": "배경 정보...",
  "guideline": "제목1\n설명1\n제목2\n설명2",  // ← 문자열!
  "business_type": "인터넷뱅킹",
  "error_code": "E001",
  "source_consultation_id": "uuid",
  "version_id": "uuid",
  "status": "APPROVED"
}
```

#### 프론트엔드 요청 타입
```typescript
// ManualVersionDetail
{
  "manual_id": "uuid",
  "version": "v2.1",
  "topic": "메뉴얼 제목",
  "keywords": ["키워드1", "키워드2"],
  "background": "배경 정보...",
  "guidelines": [                          // ← 배열로 변환됨!
    {
      "title": "제목1",
      "description": "설명1"
    },
    {
      "title": "제목2",
      "description": "설명2"
    }
  ],
  "status": "APPROVED",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

#### 백엔드 변환 로직 (Python 예시)

```python
from typing import List, Dict

def convert_manual_to_version_detail(
    entry: ManualEntryResponse,
    version: str,
) -> ManualVersionDetail:
    """ManualEntryResponse를 ManualVersionDetail로 변환"""

    # Guideline 문자열을 배열로 파싱
    guidelines = []
    lines = entry.guideline.split('\n')

    for i in range(0, len(lines), 2):
        if i + 1 < len(lines):
            guidelines.append({
                "title": lines[i].strip(),
                "description": lines[i + 1].strip()
            })

    return {
        "manual_id": entry.id,
        "version": version,
        "topic": entry.topic,
        "keywords": entry.keywords,
        "background": entry.background,
        "guidelines": guidelines,
        "status": entry.status,
        "updated_at": entry.updated_at.isoformat()
    }
```

---

## 필드 매핑 테이블

### GET /api/v1/manuals/{manual_id}/versions (버전 목록)

| 프론트 필드 | 백엔드 원본 | 변환 방식 | 예시 |
|-----------|----------|---------|------|
| value | ManualVersionResponse.version | 그대로 | "v2.1" |
| label | - | "version (현재 버전)" | "v2.1 (현재 버전)" |
| date | ManualVersionResponse.approved_at | YYYY-MM-DD 포맷 | "2024-01-15" |

### GET /api/v1/manuals/{manual_id}/versions/{version} (버전 상세)

| 프론트 필드 | 백엔드 원본 | 변환 방식 | 예시 |
|-----------|----------|---------|------|
| manual_id | ManualEntryResponse.id | 그대로 | "uuid" |
| version | 경로 파라미터 | 입력값 | "v2.1" |
| topic | ManualEntryResponse.topic | 그대로 | "인터넷뱅킹..." |
| keywords | ManualEntryResponse.keywords | 그대로 | ["키워드1"] |
| background | ManualEntryResponse.background | 그대로 | "배경..." |
| guidelines | ManualEntryResponse.guideline | 파싱 후 배열 | [{"title":"", "description":""}] |
| status | ManualEntryResponse.status | 그대로 | "APPROVED" |
| updated_at | ManualEntryResponse.updated_at | ISO 8601 | "2024-01-15T14:30:00Z" |

---

## Guideline 파싱 상세 설명

### 입력 형식 (백엔드 - OpenAPI)
```
"guideline": "계정 상태 확인\n고객의 아이디를 확인하여...\n브라우저 점검\n고객이 사용 중인..."
```

### 출력 형식 (프론트엔드)
```typescript
guidelines: [
  {
    title: "계정 상태 확인",
    description: "고객의 아이디를 확인하여..."
  },
  {
    title: "브라우저 점검",
    description: "고객이 사용 중인..."
  }
]
```

### 파싱 알고리즘

```python
def parse_guidelines(guideline_str: str) -> List[Dict[str, str]]:
    """
    줄바꿈으로 구분된 문자열을 가이드라인 배열로 변환

    형식: "제목1\n설명1\n제목2\n설명2\n..."
    """
    if not guideline_str:
        return []

    lines = guideline_str.split('\n')
    guidelines = []

    for i in range(0, len(lines), 2):
        if i + 1 < len(lines):
            title = lines[i].strip()
            description = lines[i + 1].strip()

            if title and description:  # 빈 값 제외
                guidelines.append({
                    "title": title,
                    "description": description
                })

    return guidelines
```

---

## 프론트엔드 타입 정의

### TypeScript 인터페이스

```typescript
// src/types/manuals.ts

/**
 * 메뉴얼 버전 정보
 * 버전 선택 드롭다운에서 사용
 */
export interface ManualVersionInfo {
  value: string;   // "v2.1"
  label: string;   // "v2.1 (현재 버전)"
  date: string;    // "2024-01-15"
}

/**
 * 가이드라인 항목
 */
export interface ManualGuideline {
  title: string;       // "계정 상태 확인"
  description: string; // "고객의 아이디를 확인하여..."
}

/**
 * 메뉴얼 버전 상세 정보
 */
export interface ManualVersionDetail {
  manual_id: string;            // UUID
  version: string;              // "v2.1"
  topic: string;
  keywords: string[];
  background: string;
  guidelines: ManualGuideline[];
  status: ManualDraftStatus;    // "APPROVED" | "DEPRECATED"
  updated_at: string;           // ISO 8601
}

/**
 * 변경 상태 플래그
 */
export type ChangeFlag = '' | 'ADDED' | 'REMOVED' | 'MODIFIED';
```

---

## 구현 체크리스트

### 백엔드 구현 시

- [ ] API 1: 버전 목록 조회
  - [ ] 최신순 정렬
  - [ ] 첫 번째 항목에 "(현재 버전)" 라벨 추가
  - [ ] 날짜 YYYY-MM-DD 포맷

- [ ] API 2: 버전 상세 조회
  - [ ] Guideline 문자열 → 배열 파싱
  - [ ] 필드명 정확성 확인 (guidelines, 복수형)
  - [ ] ISO 8601 datetime 반환

### 프론트엔드 연동 시

- [ ] API 호출 함수 활성화 (useManualVersionCompare.ts)
- [ ] Mock 데이터 제거 가능 (또는 fallback으로 유지)
- [ ] 에러 처리 테스트
- [ ] 타입 검사 (TypeScript strict mode)

---

## 예시: 실제 API 응답

### API 1 응답

```bash
$ curl -X GET "http://localhost:8000/api/v1/manuals/550e8400-e29b-41d4-a716-446655440000/versions"

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

### API 2 응답

```bash
$ curl -X GET "http://localhost:8000/api/v1/manuals/550e8400-e29b-41d4-a716-446655440000/versions/v2.1"

{
  "manual_id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "v2.1",
  "topic": "인터넷뱅킹 로그인 오류 처리 가이드",
  "keywords": ["인터넷뱅킹", "로그인오류", "E001"],
  "background": "고객이 인터넷뱅킹 로그인 시 오류가 발생하는 경우는...",
  "guidelines": [
    {
      "title": "계정 상태 확인",
      "description": "고객의 아이디를 확인하여 계정 잠김 여부를 확인합니다..."
    },
    {
      "title": "브라우저 및 보안프로그램 점검",
      "description": "고객이 사용 중인 브라우저 버전을 확인하고..."
    }
  ],
  "status": "APPROVED",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

## 문제 해결

### Q: Guideline 파싱이 제대로 안 됩니다

**A:** 줄바꿈 문자를 정확히 처리하세요. Python의 경우:
```python
# ✓ 올바른 방법
lines = guideline_str.split('\n')

# ✗ 피해야 할 방법
lines = guideline_str.split('\\n')  # 역슬래시 이스케이프
```

### Q: 날짜 형식이 다릅니다

**A:** 프론트엔드는 YYYY-MM-DD 형식을 기대합니다:
```python
# ✓ 올바른 형식
date_obj.strftime("%Y-%m-%d")  # "2024-01-15"

# ✗ 올바르지 않은 형식
str(date_obj)  # "2024-01-15 14:30:00"
```

### Q: Status 값이 다릅니다

**A:** 프론트엔드는 정확한 값을 기대합니다:
```
"APPROVED" (O) vs "Approved" (X) vs "approved" (X) vs "DRAFT" (O) vs "DEPRECATED" (O)
```

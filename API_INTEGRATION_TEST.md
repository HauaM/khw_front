# 메뉴얼 버전 비교 - API 연동 테스트 가이드

**작성일**: 2025년 1월
**상태**: 백엔드 API 연동 테스트 중
**목적**: 프론트엔드 ↔ 백엔드 API 통합 검증

---

## 🚀 빠른 테스트

### 1단계: 백엔드 API 상태 확인

```bash
# 백엔드 API 서버가 실행 중인지 확인
curl -X GET "http://localhost:8000/api/v1/manuals" \
  -H "Content-Type: application/json"

# 또는 실제 메뉴얼 ID로 버전 목록 조회
curl -X GET "http://localhost:8000/api/v1/manuals/{manual_id}/versions" \
  -H "Content-Type: application/json"
```

**응답 예시 (성공)**:
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

### 2단계: 프론트엔드 개발 서버 실행

```bash
npm run dev
```

### 3단계: 버전 비교 페이지 접근

```
http://localhost:5173/manuals/{manual_id}/versions/compare
```

**확인할 사항**:
- [ ] 페이지 로드됨
- [ ] 버전 드롭다운에 실제 데이터 표시됨
- [ ] 버전 선택 후 비교 데이터 표시됨
- [ ] 콘솔에 에러 없음

---

## 📋 상세 테스트 절차

### 테스트 1: 버전 목록 조회 API

**API**: `GET /api/v1/manuals/{manual_id}/versions`

**테스트**:
```bash
curl -X GET "http://localhost:8000/api/v1/manuals/550e8400-e29b-41d4-a716-446655440000/versions" \
  -H "Content-Type: application/json"
```

**검증 항목** ✅
- [ ] HTTP 상태: 200 OK
- [ ] 응답이 배열인가?
- [ ] 각 항목에 `value`, `label`, `date` 필드가 있는가?
- [ ] 버전이 최신순으로 정렬되었는가? (내림차순)
- [ ] 첫 번째 항목에만 "(현재 버전)" 라벨이 있는가?
- [ ] 날짜 형식이 YYYY-MM-DD인가?

**문제 해결**:
- 404: 메뉴얼 ID가 잘못되었을 수 있음
- 500: 백엔드 서버 오류
- 필드명 오류: 응답에서 `version` 대신 `value` 사용해야 함

---

### 테스트 2: 버전 상세 조회 API

**API**: `GET /api/v1/manuals/{manual_id}/versions/{version}`

**테스트**:
```bash
curl -X GET "http://localhost:8000/api/v1/manuals/550e8400-e29b-41d4-a716-446655440000/versions/v2.1" \
  -H "Content-Type: application/json"
```

**검증 항목** ✅
- [ ] HTTP 상태: 200 OK
- [ ] 응답이 객체인가?
- [ ] `manual_id`: UUID 형식
- [ ] `version`: 버전 문자열 (v2.1)
- [ ] `topic`: 문자열
- [ ] `keywords`: 문자열 배열
- [ ] `background`: 문자열
- [ ] `guidelines`: 배열? (문자열 아님!)
  - [ ] 각 항목에 `title`, `description` 필드가 있는가?
- [ ] `status`: "APPROVED" 또는 "DEPRECATED"
- [ ] `updated_at`: ISO 8601 형식

**문제 해결**:
- `guidelines`이 문자열인 경우:
  ```
  ❌ "guidelines": "제목1\n설명1\n제목2\n설명2"
  ✅ "guidelines": [{"title": "제목1", "description": "설명1"}, ...]
  ```
  백엔드에서 파싱 로직을 추가해야 함 (API_TYPE_MAPPING.md 참고)

---

### 테스트 3: 프론트엔드 UI 검증

**페이지**: `http://localhost:5173/manuals/{manual_id}/versions/compare`

#### 3-1. 페이지 로드

```
✅ 페이지 정상 로드
✅ 로딩 스피너 표시 (잠시)
✅ 콘솔에 에러 없음
```

#### 3-2. 버전 목록 표시

```
✅ 버전 선택 드롭다운 표시됨
✅ 모든 버전이 드롭다운에 나열됨
✅ 형식: "v2.1 (현재 버전) (2024-01-15)"
✅ 첫 번째 버전이 기본값
```

#### 3-3. 버전 선택 후

```
✅ 로딩 스피너 표시
✅ Network 탭에서 API 요청 확인
  - GET /api/v1/manuals/{manualId}/versions/v2.0
  - GET /api/v1/manuals/{manualId}/versions/v2.1
✅ 두 요청이 병렬로 실행됨 (거의 동시)
✅ 좌우 비교 화면 표시됨
```

#### 3-4. 비교 화면

**좌측 (이전 버전)**:
```
✅ 버전 표시 (v2.0)
✅ 주제, 키워드, 배경, 조치사항 표시
✅ 상태 배지 표시
✅ 날짜 표시
```

**우측 (최신 버전)**:
```
✅ 버전 표시 (v2.1)
✅ 모든 필드 표시
✅ 추가/삭제된 항목이 색상으로 표시됨
```

---

## 🔍 브라우저 DevTools 확인

### Network 탭

1. DevTools → Network 탭 열기
2. 페이지 새로고침
3. 다음 요청 확인:

```
✅ GET /api/v1/manuals/{manualId}/versions
   상태: 200
   응답: ManualVersionInfo[]

✅ GET /api/v1/manuals/{manualId}/versions/v2.0
   상태: 200
   응답: ManualVersionDetail

✅ GET /api/v1/manuals/{manualId}/versions/v2.1
   상태: 200
   응답: ManualVersionDetail
```

### Console 탭

```
❌ 에러 메시지 없음
❌ "API not available" 경고 없음
✅ 정상 작동
```

---

## 📝 API 응답 형식 검증

### 버전 목록 응답 예시

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

### 버전 상세 응답 예시

```json
{
  "manual_id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "v2.1",
  "topic": "인터넷뱅킹 로그인 오류 처리 가이드",
  "keywords": ["인터넷뱅킹", "로그인오류", "E001"],
  "background": "고객이 인터넷뱅킹 로그인 시...",
  "guidelines": [
    {
      "title": "계정 상태 확인",
      "description": "고객의 아이디를 확인하여..."
    },
    {
      "title": "브라우저 점검",
      "description": "고객이 사용 중인..."
    }
  ],
  "status": "APPROVED",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

## ⚠️ 일반적인 문제 해결

### 문제 1: 404 Not Found

**원인**: 잘못된 메뉴얼 ID

**해결**:
1. 실제 메뉴얼 ID 확인
2. UUID 형식인지 확인
3. 해당 메뉴얼이 데이터베이스에 존재하는지 확인

### 문제 2: 500 Internal Server Error

**원인**: 백엔드 서버 오류

**확인**:
1. 백엔드 로그 확인
2. 데이터베이스 연결 확인
3. API 코드 검증

### 문제 3: guidelines이 문자열

**원인**: 백엔드에서 guideline을 파싱하지 않음

**필요한 변환**:
```python
# OpenAPI 응답 (문자열)
"guideline": "제목1\n설명1\n제목2\n설명2"

# API 응답으로 변환 (배열)
"guidelines": [
  {"title": "제목1", "description": "설명1"},
  {"title": "제목2", "description": "설명2"}
]
```

**구현 참고**: BACKEND_API_GUIDE.md 또는 API_TYPE_MAPPING.md

### 문제 4: 필드명 불일치

**예시**:
```
❌ "version" (버전 목록에서)
✅ "value" (버전 목록에서)

❌ "guideline" (문자열)
✅ "guidelines" (배열)
```

---

## 🎯 체크리스트

### 백엔드 API
- [ ] GET /api/v1/manuals/{manual_id}/versions - 구현됨
- [ ] GET /api/v1/manuals/{manual_id}/versions/{version} - 구현됨
- [ ] 응답 형식이 문서와 일치
- [ ] 필드명이 정확함
- [ ] guidelines는 배열 형식
- [ ] 날짜 형식 확인 (YYYY-MM-DD, ISO 8601)

### 프론트엔드
- [ ] Mock 데이터 제거됨 ✅
- [ ] 실제 API만 호출
- [ ] 에러 처리 구현됨
- [ ] 토스트 알림 표시됨

### 통합 테스트
- [ ] API 응답 형식 검증
- [ ] UI 데이터 표시 확인
- [ ] 변경사항 감지 정확성 확인
- [ ] 에러 처리 확인

---

## 📞 문제 발생 시

API 응답 형식이 문서와 다른 경우:

1. **BACKEND_API_GUIDE.md** 다시 확인
2. **API_TYPE_MAPPING.md**에서 필드 매핑 확인
3. 백엔드팀과 협의하여 응답 형식 수정

---

**연동 테스트를 완료하면 이 파일을 삭제할 수 있습니다.**

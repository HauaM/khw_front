# 백엔드팀 질의사항 - 메뉴얼 초안 수정 API

## 현재 상황
프론트엔드에서 메뉴얼 초안 수정(저장) 기능이 mock 상태로만 작동 중입니다.
화면에는 수정사항이 보이지만 DB에 저장되지 않는 문제가 있습니다.

---

## 필수 질의사항

### 1️⃣ Draft 생성 API의 반환 ID 정보
**엔드포인트**: `POST /api/v1/manuals/draft`

**질문**:
- Draft 생성 시 응답에서 반환되는 `id` 필드가 무엇인가요?
  - `draft_id` (초안 전용 ID)인가요?
  - `manual_id` (메뉴얼 ID)인가요?
  - 둘 다 반환되나요?

**필요한 이유**: Draft 수정 API 호출 시 어떤 ID를 사용할지 결정해야 합니다.

---

### 2️⃣ Draft 수정 API 엔드포인트 확인
**현재 상황**:
- OpenAPI 문서에 `PUT /api/v1/manuals/drafts/{draft_id}` 엔드포인트가 없음
- 기존의 `PUT /api/v1/manuals/{manual_id}` 엔드포인트는 있음

**질문**:
다음 중 어느 것을 지원하나요?

**옵션 A** (권장): 새로운 Draft 전용 업데이트 엔드포인트
```
PUT /api/v1/manuals/drafts/{draft_id}
요청 바디: {
  "topic": string,
  "keywords": string[],
  "background": string,
  "guideline": string (줄바꿈으로 구분)
}
응답: ManualDraftResponse (현재 POST /api/v1/manuals/draft와 동일)
```

**옵션 B**: 기존 메뉴얼 업데이트 엔드포인트 재사용
```
PUT /api/v1/manuals/{manual_id}
(이미 OpenAPI에 정의되어 있음)
```

---

### 3️⃣ Draft와 Manual의 관계 명확화
**질문**:
- Draft는 메뉴얼의 임시 버전인가요?
- Draft 생성 후 수정 → 검토 요청 → 승인 → 메뉴얼이 되는 건가요?
- Draft ID와 Manual ID가 다른가요, 같은가요?

---

## 참고 정보

### 현재 프론트엔드 구현
**파일**: `src/hooks/useSaveManualDraft.ts`
```typescript
// 현재 Mock 상태
const mutate = async (draftId: string, payload: ManualDraftUpdateRequest): Promise<ManualDraft> => {
  // API 호출 주석 처리됨
  // const response = await updateManualDraft(draftId, payload);

  // 현재는 1초 지연 후 Mock 데이터만 반환
  await new Promise((resolve) => setTimeout(resolve, 1000));
  ...
}
```

### 관련 OpenAPI 스펙
| 엔드포인트 | 상태 | 비고 |
|---|---|---|
| `POST /api/v1/manuals/draft` | ✅ 있음 | Draft 생성 |
| `PUT /api/v1/manuals/{manual_id}` | ✅ 있음 | 메뉴얼 업데이트 |
| `PUT /api/v1/manuals/drafts/{draft_id}` | ❌ 없음 | Draft 업데이트 (필요!) |
| `POST /api/v1/manuals/{manual_id}/review` | ✅ 있음 | 검토 요청 |

---

## 구현 예정 사항
위 질문의 답변이 오면 다음을 진행하겠습니다:
1. `useSaveManualDraft.ts`의 Mock 코드 제거
2. `updateManualDraft()` API 호출 활성화
3. 실제 DB 저장 확인 테스트

---

## 추가 정보
- 프론트엔드 파일:
  - `src/hooks/useSaveManualDraft.ts` (저장 로직)
  - `src/lib/api/manuals.ts` (API 함수)
  - `src/components/manuals/ManualDraftResultView.tsx` (UI)

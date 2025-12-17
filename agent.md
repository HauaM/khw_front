# Agent Instructions

1. 모든 백엔드 API 호출은 `docs/API_COMMON_USAGE.md`의 공통 규격을 따릅니다.
   - 항상 `ApiResponse<T>` 타입을 사용하고 `success`, `data`, `error`, `meta`, `feedback` 구조를 검증합니다.
   - 실패 응답도 HTTP 200을 포함해 `success: false` 형태일 수 있으므로 `isApiSuccess`/`isApiError` 가드를 활용합니다.

2. API 레이어는 `src/lib/api/*`에서 타입을 명시하고 `api.get`/`api.post` 등에 `ApiResponse` 제네릭을 붙여 선언합니다.
   - axios를 직접 쓰지 않고 `useApiQuery`, `useApiMutation`으로 감싼 함수만 사용합니다 (직접 try/catch 금지).

3. 프론트엔드 컴포넌트는 React Query 훅을 통한 호출을 기본으로 둡니다.
   - `useApiQuery`와 `useApiMutation` 옵션으로 `autoShowFeedback`, `autoShowError`, `successMessage`, `errorMessages`를 관리합니다.
   - 피드백은 `useFeedback`으로 처리하고, 에러는 `useApiError`로 분리해 메시지 커스터마이징, 재시도 로직을 구현합니다.

4. 피드백과 오류는 명시적으로 분리해서 다루고, 에러 코드 상수(`API_ERROR_CODES.*`) 혹은 `errorMessages`를 통해 사용자 친화 메시지를 제공합니다.

5. 이상 징후가 발견되면 관련 디버깅 팁(네트워크 응답 확인, `ApiResponseError` 로그, 토스트 순서 등)을 참고해 처리합니다.

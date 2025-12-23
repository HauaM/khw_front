import { useCallback, useState } from 'react';
import type { Consultation } from '@/lib/api/consultations';
import { createManualDraft } from '@/lib/api/manuals';
import type { ManualDraftResponse, ManualDraftCreatePayload } from '@/lib/api/manuals';

interface UseCreateManualDraftOptions {
  onSuccess?: (draft: ManualDraftResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * 메뉴얼 초안 생성 훅 (현재는 mock, 추후 API 연동 예정)
 * TODO: React Query 도입 시 createManualDraft 호출로 교체
 */
const useCreateManualDraft = (options?: UseCreateManualDraftOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (consultation: Consultation) => {
      setIsLoading(true);
      setError(null);

      const requestBody: ManualDraftCreatePayload = {
        consultation_id: consultation.id,
        enforce_hallucination_check: true,
      };

      try {
        // OpenAPI 기반 실제 API 호출
        const response = await createManualDraft(requestBody);

        if (!response.data) {
          throw new Error('메뉴얼 초안 생성 실패: 응답 데이터 없음');
        }

        options?.onSuccess?.(response.data as unknown as ManualDraftResponse);
        return response.data;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('메뉴얼 초안 생성 중 오류가 발생했습니다.');
        setError(normalizedError);
        options?.onError?.(normalizedError);
        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { mutate, isLoading, isError: Boolean(error), error };
};

export default useCreateManualDraft;

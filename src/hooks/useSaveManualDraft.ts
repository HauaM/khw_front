import { useState } from 'react';
import { ManualDraft, ManualDraftUpdateRequest } from '@/types/manuals';
import { updateManualDraft, convertApiResponseToManualDraft } from '@/lib/api/manuals';

export interface UseSaveManualDraftResult {
  mutate: (draftId: string, payload: ManualDraftUpdateRequest) => Promise<ManualDraft>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: ManualDraft | null;
}

/**
 * 메뉴얼 초안을 저장하는 훅
 * OpenAPI: PUT /api/v1/manuals/{manual_id}
 *
 * 백엔드 확인 결과:
 * - Draft 생성 시 반환되는 id = manual_id (동일)
 * - Draft 수정은 PUT /api/v1/manuals/{manual_id}로 수행
 * - Draft와 Manual은 같은 ManualEntry 객체 (상태만 다름)
 */
export const useSaveManualDraft = (): UseSaveManualDraftResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ManualDraft | null>(null);

  const mutate = async (draftId: string, payload: ManualDraftUpdateRequest): Promise<ManualDraft> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // 실제 API 호출: PUT /api/v1/manuals/{draftId}
      const response = await updateManualDraft(draftId, payload);

      if (!response.data) {
        throw new Error('초안 저장 실패: 응답 데이터 없음');
      }

      const result = convertApiResponseToManualDraft(response.data);

      setData(result);
      return result;
    } catch (err) {
      setIsError(true);
      const error = err instanceof Error ? err : new Error('초안 저장에 실패했습니다.');
      setError(error);
      console.error('Error saving manual draft:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, isError, error, data };
};

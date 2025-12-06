import { useState } from 'react';
import { ManualDraft, ManualDraftUpdateRequest } from '@/types/manuals';
// TODO: API 연결 시 활성화
// import { updateManualDraft, convertApiResponseToManualDraft, stringToGuidelines } from '@/lib/api/manuals';
import { stringToGuidelines } from '@/lib/api/manuals';

export interface UseSaveManualDraftResult {
  mutate: (draftId: string, payload: ManualDraftUpdateRequest) => Promise<ManualDraft>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: ManualDraft | null;
}

/**
 * 메뉴얼 초안을 저장하는 훅
 * OpenAPI: PUT /api/v1/manuals/drafts/{draft_id}
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
      // TODO: API 연결 - 아래 주석을 풀면 실제 API 호출
      // const response = await updateManualDraft(draftId, payload);
      // const result = convertApiResponseToManualDraft(response);

      // 현재는 mock 저장 (1초 지연)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockResult: ManualDraft = {
        id: draftId,
        status: 'DRAFT',
        topic: payload.topic,
        keywords: payload.keywords,
        background: payload.background,
        // payload.guideline은 줄바꿈으로 구분된 문자열이므로 배열로 변환
        guideline: stringToGuidelines(payload.guideline),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setData(mockResult);
      return mockResult;
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

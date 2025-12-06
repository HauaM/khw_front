import { useEffect, useState } from 'react';
import { ManualDraft } from '@/types/manuals';
// TODO: API 연결 시 활성화
// import { getManualDraft, convertApiResponseToManualDraft } from '@/lib/api/manuals';

export interface UseManualDraftResult {
  data: ManualDraft | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 메뉴얼 초안 데이터를 조회하는 훅
 * 현재는 mock 데이터를 사용하며, 나중에 API와 연결할 수 있도록 설계됨
 */
export const useManualDraft = (draftId: string): UseManualDraftResult => {
  const [data, setData] = useState<ManualDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock initial data
  const mockDraftData: ManualDraft = {
    id: draftId,
    status: 'DRAFT',
    keywords: ['인터넷뱅킹', '로그인오류', 'E001', '비밀번호'],
    topic: '인터넷뱅킹 로그인 오류 처리 가이드',
    background: `고객이 인터넷뱅킹 로그인 시도 중 "비밀번호가 일치하지 않습니다" 오류 메시지를 받았습니다.
고객은 비밀번호를 정확히 입력했다고 주장하며, 여러 번 시도했으나 동일한 오류가 발생했습니다.
시스템 로그 확인 결과, 고객의 계정이 비밀번호 5회 오류로 임시 잠금 상태였습니다.`,
    guideline: [
      '고객에게 계정이 임시 잠금 상태임을 안내하고, 보안을 위한 조치임을 설명합니다.',
      '고객의 신원을 확인한 후, 관리자 권한으로 계정 잠금을 해제합니다.',
      '비밀번호 재설정 차를 안내하고, 고객이 비밀번호를 설정하도록 돕습니다.',
    ],
  };

  const fetchDraft = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // TODO: API 연결 - 아래 주석을 풀면 실제 API 호출
      // const response = await getManualDraft(draftId);
      // setData(response);

      // 현재는 mock 데이터 사용 (1초 지연)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(mockDraftData);
    } catch (err) {
      setIsError(true);
      const error = err instanceof Error ? err : new Error('초안 조회에 실패했습니다.');
      setError(error);
      console.error('Error fetching manual draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, [draftId]);

  const refetch = async () => {
    await fetchDraft();
  };

  return { data, isLoading, isError, error, refetch };
};

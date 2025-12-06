import { useEffect, useState } from 'react';
import type { Consultation } from '@/lib/api/consultations';

interface UseConsultationDetailResult {
  data: Consultation | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const MOCK_CONSULTATION: Consultation = {
  id: 'CONS-1234567890',
  branch_code: 'BR001',
  branch_name: '본점',
  employee_id: 'EMP1234',
  employee_name: '홍길동',
  screen_id: 'SCR0001',
  transaction_name: '예금계좌 개설',
  business_type: 'DEPOSIT',
  error_code: 'E001',
  inquiry_text:
    '예금계좌 개설 화면(SCR0001)에서 고객 입력 후 E001이 발생했습니다. 주민등록번호를 입력했지만 "주민등록번호 인증 실패" 메시지와 함께 다음 단계로 진행되지 않는 상황입니다.',
  action_taken:
    '주민등록번호 입력 필드를 재확인했고, 하이픈(-) 없이 13자리를 입력하도록 안내했습니다. 동일 증상이 반복돼 플레이스홀더 수정 및 자동 하이픈 제거 기능 개선을 건의했습니다.',
  created_at: '2024-01-15T14:32:05Z',
  metadata_fields: {
    고객번호: '1234567890',
    고객등급: 'VIP',
    상담채널: '전화',
    처리시간: '약 10분',
  },
};

/**
 * 상담 상세 조회 훅 (현재는 mock, 추후 API 연동 예정)
 * TODO: React Query 도입 시 getConsultationById 사용하도록 교체
 */
const useConsultationDetail = (consultationId?: string): UseConsultationDetailResult => {
  const [data, setData] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!consultationId) {
      setData(null);
      setError(new Error('상담 ID가 없습니다.'));
      return () => undefined;
    }

    setIsLoading(true);
    setError(null);

    // TODO: 실제 API 사용 시 아래 mock 부분을 getConsultationById(consultationId) 호출로 대체
    timer = setTimeout(() => {
      if (cancelled) return;
      const mockData = { ...MOCK_CONSULTATION, id: consultationId };
      setData(mockData);
      setIsLoading(false);
    }, 800);

    // 예시: API 연동 시
    // getConsultationById(consultationId)
    //   .then((res) => {
    //     if (cancelled) return;
    //     setData(res);
    //   })
    //   .catch((err: Error) => {
    //     if (cancelled) return;
    //     setError(err);
    //   })
    //   .finally(() => {
    //     if (cancelled) return;
    //     setIsLoading(false);
    //   });

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [consultationId]);

  return {
    data,
    isLoading,
    isError: Boolean(error),
    error,
  };
};

export default useConsultationDetail;

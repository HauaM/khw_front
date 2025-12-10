import { useEffect, useState } from 'react';
import { getConsultationById } from '@/lib/api/consultations';
import type { Consultation } from '@/lib/api/consultations';

interface UseConsultationDetailResult {
  data: Consultation | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 상담 상세 조회 훅
 */
const useConsultationDetail = (consultationId?: string): UseConsultationDetailResult => {
  const [data, setData] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!consultationId) {
      setData(null);
      setError(new Error('상담 ID가 없습니다.'));
      return () => undefined;
    }

    setIsLoading(true);
    setError(null);

    getConsultationById(consultationId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err);
        setData(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
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

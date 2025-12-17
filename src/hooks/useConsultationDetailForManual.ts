import type { UseQueryResult } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getConsultationDetail } from '@/lib/api/consultations';
import type { ConsultationDetail } from '@/types/consultations';
import type { ConsultationResponse } from '@/lib/api/consultations';

/**
 * 상담 원본 상세 정보 조회 hook (승인된 메뉴얼 모달용)
 * @param consultationId - 상담 ID (UUID)
 * @param enabled - 쿼리 실행 여부
 * @returns useQuery result
 */
const mapToDetail = (response: ConsultationResponse): ConsultationDetail => ({
  id: response.id,
  summary: response.summary,
  inquiry: response.inquiry_text,
  action: response.action_taken,
  created_at: response.created_at,
  updated_at: response.updated_at,
  consultation_date: response.consultation_date ?? undefined,
  branch_code: response.branch_code,
  employee_id: response.employee_id,
  business_type: response.business_type ?? undefined,
  error_code: response.error_code ?? undefined,
  metadata_fields: response.metadata_fields ?? undefined,
});

interface UseConsultationDetailForManualResult
  extends Omit<UseQueryResult<ConsultationResponse, Error>, 'data'> {
  data: ConsultationDetail | null;
}

export const useConsultationDetailForManual = (
  consultationId: string | null,
  enabled: boolean = true
): UseConsultationDetailForManualResult => {
  const query = useApiQuery<ConsultationResponse>(
    ['consultationDetail', consultationId],
    () => getConsultationDetail(consultationId || ''),
    {
      queryOptions: {
        enabled: enabled && !!consultationId,
        staleTime: 5 * 60 * 1000, // 5분
        cacheTime: 10 * 60 * 1000, // 10분
      },
    }
  );

  const detail = query.data ? mapToDetail(query.data) : null;

  return {
    ...query,
    data: detail,
  };
};

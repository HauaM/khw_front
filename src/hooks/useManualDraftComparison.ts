import { useApiQuery } from '@/hooks/useApiQuery';
import { getManualDraftComparison } from '@/lib/api/manuals';
import { ManualDraftCreateResponse } from '@/types/manuals';

/**
 * 메뉴얼 초안 비교 정보 조회 훅
 *
 * GET /api/v1/manuals/draft/{manual_id}를 사용하여
 * 초안 데이터와 함께 비교 정보(comparison_type, existing_manual, similarity_score)를 조회합니다.
 *
 * @param manualId - 메뉴얼 초안 ID
 * @param enabled - 쿼리 실행 여부 (기본값: true)
 * @returns useApiQuery 결과 (data는 ManualDraftCreateResponse 타입)
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useManualDraftComparison(draftId);
 *
 * if (data) {
 *   console.log(data.comparison_type); // 'new' | 'similar' | 'supplement'
 *   console.log(data.draft_entry); // 초안 전체 데이터
 *   console.log(data.existing_manual); // 기존 메뉴얼 (있으면)
 *   console.log(data.similarity_score); // 유사도
 * }
 * ```
 */
export const useManualDraftComparison = (manualId: string, enabled = true) => {
  return useApiQuery<ManualDraftCreateResponse>(
    ['manualDraftComparison', manualId],
    () => getManualDraftComparison(manualId),
    {
      // React Query options는 queryOptions 안에
      queryOptions: {
        enabled: !!manualId && enabled,
        staleTime: 5 * 60 * 1000, // 5분 캐싱
      },
      // 에러는 자동으로 Toast로 표시됨 (useApiQuery 기본 동작)
      autoShowError: true,
    }
  );
};
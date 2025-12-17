import { useApiQuery } from '@/hooks/useApiQuery';
import { getApprovedManualGroup } from '@/lib/api/manuals';
import type { ApprovedManualCardItem } from '@/types/manuals';

/**
 * 승인된 메뉴얼 그룹 조회 hook
 * @param manualId - 메뉴얼 ID (UUID)
 */
export const useApprovedManualCards = (manualId: string | null) => {
  return useApiQuery<ApprovedManualCardItem[]>(
    ['approvedManualGroup', manualId],
    () => {
      if (!manualId) {
        throw new Error('manualId is required');
      }
      return getApprovedManualGroup(manualId);
    },
    {
      queryOptions: {
        enabled: !!manualId,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
      },
      autoShowFeedback: true,
      autoShowError: true,
      successMessage: '승인된 메뉴얼을 불러왔습니다.',
    }
  );
};

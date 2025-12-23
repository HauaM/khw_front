import { useApiQuery } from '@/hooks/useApiQuery';
import { getApprovedManuals } from '@/lib/api/manuals';
import type { ManualCardItem } from '@/types/manuals';

export const useApprovedManualCards = (manualId: string | null) => {
  const query = useApiQuery<ManualCardItem[]>(
    ['approvedManualCards', manualId],
    () => getApprovedManuals(manualId as string),
    {
      queryOptions: {
        enabled: !!manualId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      autoShowFeedback: false,
      autoShowError: true,
    }
  );

  return {
    data: (query.data as ManualCardItem[]) || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  };
};

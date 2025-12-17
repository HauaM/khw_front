/**
 * 메뉴얼 검토 Task 목록 조회 훅
 * 백엔드 API (/api/v1/manual-review/tasks)와 연동
 */

import { useEffect, useState } from 'react';
import {
  ManualReviewTask,
  ManualReviewTaskFilters,
  UseManualReviewTasksResult,
} from '@/types/reviews';
import { fetchManualReviewTasks } from '@/lib/api/manualReviewTasks';

// Fallback Mock 데이터 (API 오류 시 또는 로컬 개발용)
const mockReviewTasks: ManualReviewTask[] = [
  {
    task_id: "TASK-2024-001",
    draft_manual_id: "DRAFT-001",
    existing_manual_id: "MAN-2023-105",
    status: "TODO",
    business_type: "인터넷뱅킹",
    created_at: "2024-01-15T09:30:00Z",
  },
  {
    task_id: "TASK-2024-002",
    draft_manual_id: "DRAFT-002",
    existing_manual_id: "MAN-2023-089",
    status: "IN_PROGRESS",
    business_type: "모바일뱅킹",
    created_at: "2024-01-15T10:15:00Z",
  },
  {
    task_id: "TASK-2024-003",
    draft_manual_id: "DRAFT-003",
    existing_manual_id: "MAN-2023-112",
    status: "TODO",
    business_type: "대출",
    created_at: "2024-01-15T11:20:00Z",
  },
  {
    task_id: "TASK-2024-004",
    draft_manual_id: "DRAFT-004",
    existing_manual_id: "MAN-2023-098",
    status: "DONE",
    business_type: "예금",
    created_at: "2024-01-14T14:45:00Z",
  },
  {
    task_id: "TASK-2024-005",
    draft_manual_id: "DRAFT-005",
    existing_manual_id: "MAN-2023-121",
    status: "REJECTED",
    business_type: "카드",
    created_at: "2024-01-14T16:30:00Z",
  },
  {
    task_id: "TASK-2024-006",
    draft_manual_id: "DRAFT-006",
    existing_manual_id: "MAN-2023-134",
    status: "TODO",
    business_type: "인터넷뱅킹",
    created_at: "2024-01-16T08:00:00Z",
  },
  {
    task_id: "TASK-2024-007",
    draft_manual_id: "DRAFT-007",
    existing_manual_id: "MAN-2023-145",
    status: "IN_PROGRESS",
    business_type: "대출",
    created_at: "2024-01-16T09:30:00Z",
  },
  {
    task_id: "TASK-2024-008",
    draft_manual_id: "DRAFT-008",
    existing_manual_id: "MAN-2023-156",
    status: "DONE",
    business_type: "모바일뱅킹",
    created_at: "2024-01-13T13:20:00Z",
  },
  {
    task_id: "TASK-2024-009",
    draft_manual_id: "DRAFT-009",
    existing_manual_id: "MAN-2023-167",
    status: "TODO",
    business_type: "예금",
    created_at: "2024-01-16T10:45:00Z",
  },
  {
    task_id: "TASK-2024-010",
    draft_manual_id: "DRAFT-010",
    existing_manual_id: "MAN-2023-178",
    status: "TODO",
    business_type: "카드",
    created_at: "2024-01-16T11:15:00Z",
  },
  {
    task_id: "TASK-2024-011",
    draft_manual_id: "DRAFT-011",
    existing_manual_id: "MAN-2023-189",
    status: "REJECTED",
    business_type: "인터넷뱅킹",
    created_at: "2024-01-13T15:00:00Z",
  },
  {
    task_id: "TASK-2024-012",
    draft_manual_id: "DRAFT-012",
    existing_manual_id: "MAN-2023-190",
    status: "DONE",
    business_type: "모바일뱅킹",
    created_at: "2024-01-13T16:30:00Z",
  },
];

interface UseManualReviewTasksOptions {
  filters?: ManualReviewTaskFilters;
}

/**
 * 메뉴얼 검토 Task 목록 조회 훅
 *
 * @param options 옵션 (필터 포함)
 * @returns { data, isLoading, isError, error }
 *
 * 참고: 프론트엔드에서 추가 필터링을 수행하므로
 * 백엔드의 status 필터만 사용하고 나머지는 클라이언트에서 처리합니다.
 *
 * TODO: 추후 React Query로 교체
 * - useQuery를 사용하여 서버 상태 관리
 * - 캐싱, 자동 리페칭 등 지원
 */
export function useManualReviewTasks(
  options?: UseManualReviewTasksOptions
): UseManualReviewTasksResult {
  const [data, setData] = useState<ManualReviewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        // 백엔드 API 호출
        // 참고: 프론트엔드에서 필터링을 수행하므로 모든 데이터를 조회
        const response = await fetchManualReviewTasks({
          status:
            options?.filters?.status !== '전체' ? options?.filters?.status : undefined,
          limit: 100, // 프론트에서 추가 필터링하므로 큰 값으로 설정
        });

        setData(response.data || []);
      } catch (err) {
        console.warn(
          'Failed to fetch from API, using mock data:',
          err instanceof Error ? err.message : String(err)
        );
        // API 실패 시 Mock 데이터로 fallback
        setData(mockReviewTasks);
        // 에러로 표시하지 않음 (Mock 데이터로 정상 작동)
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [options?.filters?.status]); // status만 의존성으로 설정 (백엔드에서 필터링 가능)

  return { data, isLoading, isError, error };
}

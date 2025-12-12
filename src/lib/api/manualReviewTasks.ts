/**
 * 메뉴얼 검토 Task 관련 API 함수
 * OpenAPI 문서 기준 엔드포인트 사용:
 * - GET /api/v1/manual-review/tasks (검토 Task 목록 조회)
 * - POST /api/v1/manual-review/tasks/{task_id}/approve (Task 승인)
 * - POST /api/v1/manual-review/tasks/{task_id}/reject (Task 반려)
 */

import axiosClient from '@/lib/api/axiosClient';
import {
  ManualReviewTask,
  BackendManualReviewTask,
  ManualReviewTaskQueryParams,
  ManualReviewTasksResponse,
  ManualReviewDetail,
  ManualEntry,
  BusinessType,
} from '@/types/reviews';

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 * BackendManualReviewTask -> ManualReviewTask
 */
export function transformBackendTask(task: BackendManualReviewTask & Record<string, any>): ManualReviewTask {
  return {
    task_id: task.id,
    draft_manual_id: task.new_entry_id,
    existing_manual_id: task.old_entry_id || 'N/A',
    status: task.status,
    created_at: task.created_at,
    // 테이블 표시용 필드 (API에서 제공 시)
    new_manual_topic: task.new_manual_topic,
    business_type_name: task.business_type_name,
    new_error_code: task.new_error_code,
    // 기존 필드 (하위호환성)
    business_type: (task.business_type || '인터넷뱅킹') as BusinessType,
    // 추가 필드
    similarity: task.similarity,
    reviewer_id: task.reviewer_id,
    review_notes: task.review_notes,
    old_manual_summary: task.old_manual_summary,
    new_manual_summary: task.new_manual_summary,
    diff_text: task.diff_text,
    diff_json: task.diff_json,
  };
}

/**
 * 메뉴얼 검토 Task 목록 조회
 * @param params 쿼리 파라미터
 * @returns Task 목록
 */
export async function fetchManualReviewTasks(
  params?: ManualReviewTaskQueryParams
): Promise<ManualReviewTasksResponse> {
  try {
    // OpenAPI: GET /api/v1/manual-review/tasks
    // status는 optional(str | None)이므로, undefined일 때는 자동으로 제외됨
    const response = await axiosClient.get<BackendManualReviewTask[]>(
      '/api/v1/manual-review/tasks',
      {
        params: {
          status: params?.status || undefined,
          limit: params?.limit || 100,
        },
      }
    );

    const tasks = response.data.map(transformBackendTask);

    return {
      data: tasks,
      total: tasks.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  } catch (error) {
    console.error('Failed to fetch manual review tasks:', error);
    throw error;
  }
}

/**
 * 메뉴얼 엔트리 조회 (ManualEntry)
 * @param entryId 엔트리 ID (uuid)
 * @returns 메뉴얼 엔트리 정보
 */
export async function fetchManualEntry(entryId: string): Promise<ManualEntry | null> {
  try {
    // OpenAPI: GET /api/v1/manuals (목록에서 필터링)
    // status_filter는 optional(ManualStatus | None)이므로 undefined일 때 자동으로 제외됨
    const response = await axiosClient.get<any[]>(
      '/api/v1/manuals',
      {
        params: {
          limit: 100,
          status_filter: undefined, // status_filter는 backend에서 renamed (status -> status_filter)
        },
      }
    );

    const entry = response.data.find((manual: any) => manual.id === entryId);
    if (entry) {
      return {
        id: entry.id,
        keywords: entry.keywords || [],
        topic: entry.topic,
        background: entry.background,
        guideline: entry.guideline,
        business_type: entry.business_type,
        error_code: entry.error_code,
        source_consultation_id: entry.source_consultation_id,
        version_id: entry.version_id,
        status: entry.status,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch manual entry ${entryId}:`, error);
    // 에러 시에도 null 반환 (필수 필드는 아님)
    return null;
  }
}

/**
 * 메뉴얼 검토 상세 정보 조회
 * task_id로 검토 Task를 조회하고, old_entry_id와 new_entry_id로 메뉴얼 데이터를 병렬 조회
 *
 * @param taskId Task ID
 * @returns 검토 상세 정보 (메뉴얼 데이터 포함)
 */
export async function fetchManualReviewDetail(
  taskId: string
): Promise<ManualReviewDetail> {
  try {
    // 1. Task 조회
    const tasksResponse = await axiosClient.get<BackendManualReviewTask[]>(
      '/api/v1/manual-review/tasks',
      {
        params: {
          limit: 100,
          status: undefined, // status는 optional이므로 명시적으로 제외
        },
      }
    );

    const backendTask = tasksResponse.data.find((t) => t.id === taskId);
    if (!backendTask) {
      throw new Error(`Manual review task not found: ${taskId}`);
    }

    // 2. old_entry_id와 new_entry_id로 메뉴얼 데이터 병렬 조회
    const [oldManual, newManual] = await Promise.allSettled([
      backendTask.old_entry_id ? fetchManualEntry(backendTask.old_entry_id) : Promise.resolve(null),
      fetchManualEntry(backendTask.new_entry_id),
    ]);

    const oldManualData = oldManual.status === 'fulfilled' ? oldManual.value : null;
    const newManualData = newManual.status === 'fulfilled' ? newManual.value : null;

    // 3. ManualReviewDetail 구성
    const detail: ManualReviewDetail = {
      task_id: backendTask.id,
      status: backendTask.status,
      created_at: backendTask.created_at,
      updated_at: backendTask.updated_at,
      old_entry_id: backendTask.old_entry_id,
      new_entry_id: backendTask.new_entry_id,
      similarity: backendTask.similarity,
      reviewer_id: backendTask.reviewer_id,
      review_notes: backendTask.review_notes,
      old_manual_summary: backendTask.old_manual_summary,
      new_manual_summary: backendTask.new_manual_summary,
      diff_text: backendTask.diff_text,
      diff_json: backendTask.diff_json,
      // 메뉴얼 데이터 병합 (UI 표시용)
      old_manual: oldManualData || undefined,
      new_manual: newManualData || undefined,
    };

    return detail;
  } catch (error) {
    console.error('Failed to fetch manual review detail:', error);
    throw error;
  }
}

/**
 * 메뉴얼 검토 Task 승인
 * @param taskId Task ID
 * @param employeeId 검토자 employee_id (사용자 ID)
 * @param reviewNotes 검토 의견
 * @returns 승인된 Task 정보
 */
export async function approveManualReviewTask(
  taskId: string,
  employeeId: string,
  reviewNotes?: string
): Promise<BackendManualReviewTask> {
  try {
    // OpenAPI: POST /api/v1/manual-review/tasks/{task_id}/approve
    // ManualReviewApproval 스키마: employee_id (검토자의 employee_id), create_new_version, notes
    const requestBody: Record<string, any> = {
      employee_id: employeeId,
      create_new_version: true,
    };

    // review_notes가 있을 경우만 포함 (undefined 제외)
    if (reviewNotes !== undefined) {
      requestBody.review_notes = reviewNotes;
    }

    const response = await axiosClient.post<BackendManualReviewTask>(
      `/api/v1/manual-review/tasks/${taskId}/approve`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error('Failed to approve manual review task:', error);
    throw error;
  }
}

/**
 * 메뉴얼 검토 Task 반려
 * @param taskId Task ID
 * @param reviewNotes 반려 사유 (최소 10글자)
 * @returns 반려된 Task 정보
 */
export async function rejectManualReviewTask(
  taskId: string,
  reviewNotes: string
): Promise<BackendManualReviewTask> {
  try {
    // OpenAPI: POST /api/v1/manual-review/tasks/{task_id}/reject
    // ManualReviewRejection 스키마: review_notes만 필요
    const response = await axiosClient.post<BackendManualReviewTask>(
      `/api/v1/manual-review/tasks/${taskId}/reject`,
      {
        review_notes: reviewNotes,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to reject manual review task:', error);
    throw error;
  }
}

/**
 * 메뉴얼 검토 Task 시작 (TODO → IN_PROGRESS)
 * @param taskId Task ID
 * @returns 시작된 Task 정보
 */
export async function startManualReviewTask(
  taskId: string
): Promise<BackendManualReviewTask> {
  try {
    // OpenAPI: PUT /api/v1/manual-review/tasks/{task_id}
    // FR-6: 검토 태스크 시작 (TODO → IN_PROGRESS)
    const response = await axiosClient.put<BackendManualReviewTask>(
      `/api/v1/manual-review/tasks/${taskId}`,
      {}
    );

    return response.data;
  } catch (error) {
    console.error('Failed to start manual review task:', error);
    throw error;
  }
}

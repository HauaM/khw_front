/**
 * 메뉴얼 초안 조회 페이지 (FR-16)
 *
 * LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchManualReviewTasks } from '@/lib/api/manualReviewTasks';
import ManualDraftTable, { ManualDraftTableRow } from '@/components/manuals/ManualDraftTable';
import { ManualReviewTask } from '@/types/reviews';


// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const mapTaskToRow = (task: ManualReviewTask): ManualDraftTableRow => ({
  id: task.task_id,
  manual_id: task.draft_manual_id,
  topic: task.new_manual_topic || '제목 없음',
  keywords: task.new_manual_keywords || [],
  business_type_name: task.business_type_name,
  error_code: task.new_error_code,
  created_at: task.created_at,
  status: task.status,
  source_consultation_id: task.source_consultation_id,
});

const ManualDraftListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [drafts, setDrafts] = useState<ManualDraftTableRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchManualReviewTasks({
        limit: 100,
        status: 'TODO',
      });

      setDrafts(response.data.map(mapTaskToRow));
      setTotalCount(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '초안 목록을 불러올 수 없습니다.';
      setError(errorMessage);
      setDrafts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Render
  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">메뉴얼 초안 목록</h1>
        <p className="text-sm text-gray-600">
          LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-700 rounded text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-600 text-sm">
          불러오는 중...
        </div>
      ) : (
        <ManualDraftTable
          drafts={drafts}
          totalCount={totalCount}
          onSelectDraft={(draft) =>
            navigate(`/manuals/drafts/${draft.manual_id}`, {
              replace: false,
              state: {
                reviewTaskId: draft.reviewTaskId,
              },
            })
          }
        />
      )}
    </div>
  );
};

export default ManualDraftListPage;

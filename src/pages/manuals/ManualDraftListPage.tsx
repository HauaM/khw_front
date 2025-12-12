/**
 * 메뉴얼 초안 조회 페이지 (FR-16)
 *
 * LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManualDraftList, ManualDraftListResponse } from '@/lib/api/manuals';
import ManualDraftTable from '@/components/manuals/ManualDraftTable';


// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const ManualDraftListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [drafts, setDrafts] = useState<ManualDraftListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getManualDraftList({
        status_filter: 'DRAFT',
        limit: 100,
      });

      setDrafts(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '초안 목록을 불러올 수 없습니다.';
      setError(errorMessage);
      setDrafts([]);
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
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen p-6">
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
          totalCount={drafts.length}
          onSelectDraft={(draftId) => navigate(`/manuals/drafts/${draftId}`, { replace: false })}
        />
      )}
    </div>
  );
};

export default ManualDraftListPage;

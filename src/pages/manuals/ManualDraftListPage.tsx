/**
 * 메뉴얼 초안 조회 페이지 (FR-16)
 *
 * LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getManualDraftList, deleteManualDraft, ManualDraftListResponse } from '@/lib/api/manuals';
import ManualDraftTable from '@/components/manuals/ManualDraftTable';

// ─────────────────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: #fafafa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #212121;
  margin: 0;
  line-height: 1.4;
`;

const PageDescription = styled.p`
  font-size: 14px;
  color: #6e6e6e;
  margin: 0;
  line-height: 1.5;
`;

const ErrorAlert = styled.div`
  padding: 12px 16px;
  background-color: #ffebee;
  border-left: 4px solid #c62828;
  border-radius: 4px;
  color: #c62828;
  font-size: 13px;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6e6e6e;
  font-size: 14px;
`;

const SuccessToast = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  background-color: #e8f5e9;
  border-left: 4px solid #2e7d32;
  border-radius: 4px;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 500;
  animation: slideIn 0.3s ease-in-out;
  z-index: 1000;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const ManualDraftListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [drafts, setDrafts] = useState<ManualDraftListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    draftId: string | null;
    topic: string | null;
  }>({ show: false, draftId: null, topic: null });

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

  // Handle delete
  const handleDeleteDraft = async (draftId: string) => {
    try {
      await deleteManualDraft(draftId);
      setDrafts(drafts.filter((d) => d.id !== draftId));
      setSuccessMessage('삭제가 완료되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setDeleteConfirm({ show: false, draftId: null, topic: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      setError(errorMessage);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = (draftId: string, topic: string) => {
    setDeleteConfirm({ show: true, draftId, topic });
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, draftId: null, topic: null });
  };

  // Render
  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <PageTitle>메뉴얼 초안 목록</PageTitle>
        <PageDescription>
          LLM으로 생성된 DRAFT 메뉴얼을 조회하고, 승인/삭제를 위한 기초 정보를 제공합니다.
        </PageDescription>
      </PageHeader>

      {/* Error Alert */}
      {error && <ErrorAlert>{error}</ErrorAlert>}

      {/* Table */}
      {loading ? (
        <LoadingMessage>불러오는 중...</LoadingMessage>
      ) : (
        <ManualDraftTable
          drafts={drafts}
          totalCount={drafts.length}
          onSelectDraft={(draftId) => navigate(`/manuals/drafts/${draftId}`)}
          onDeleteDraft={handleDeleteConfirm}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm.show && deleteConfirm.draftId && (
        <DeleteConfirmDialog
          topic={deleteConfirm.topic}
          onConfirm={() => handleDeleteDraft(deleteConfirm.draftId!)}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Success Toast */}
      {successMessage && <SuccessToast>{successMessage}</SuccessToast>}
    </PageContainer>
  );
};

// ─────────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────────

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const DialogContent = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 24px;
  max-width: 400px;
  width: 90%;
`;

const DialogTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 12px 0;
`;

const DialogMessage = styled.p`
  font-size: 14px;
  color: #6e6e6e;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DialogButton = styled.button<{ isDanger?: boolean }>`
  min-height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${(props: { isDanger?: boolean }) =>
    props.isDanger
      ? `
    background-color: #c62828;
    color: #ffffff;
    &:hover {
      background-color: #9b1f20;
    }
  `
      : `
    background-color: #ffffff;
    color: #005bac;
    border: 1px solid #005bac;
    &:hover {
      background-color: #e8f1fb;
    }
  `}
`;

interface DeleteConfirmDialogProps {
  topic: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  topic,
  onConfirm,
  onCancel,
}) => {
  return (
    <DialogOverlay onClick={onCancel}>
      <DialogContent onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <DialogTitle>메뉴얼 초안 삭제</DialogTitle>
        <DialogMessage>
          {topic && (
            <>
              "{topic}"<br />
            </>
          )}
          해당 메뉴얼 초안(DRAFT)을 삭제하시겠습니까?
          <br />
          삭제 후에는 목록에서 더 이상 조회할 수 없습니다.
        </DialogMessage>
        <DialogButtons>
          <DialogButton onClick={onCancel}>취소</DialogButton>
          <DialogButton isDanger onClick={onConfirm}>
            삭제
          </DialogButton>
        </DialogButtons>
      </DialogContent>
    </DialogOverlay>
  );
};

export default ManualDraftListPage;

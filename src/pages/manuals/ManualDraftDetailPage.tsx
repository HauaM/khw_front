/**
 * 메뉴얼 초안 상세 페이지
 *
 * 초안 목록에서 클릭한 항목의 상세 정보를 표시합니다.
 * 전체 메뉴얼 초안 정보와 삭제 기능을 제공합니다.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getManualDetail, ManualDetail } from '@/lib/api/manuals';

// ─────────────────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: #fafafa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6e6e6e;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #212121;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #212121;
  margin: 0;
  line-height: 1.4;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
`;

const ContentCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08);
  padding: 24px;
`;

const FieldGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #005bac;
  display: block;
  margin-bottom: 8px;
`;

const FieldValue = styled.div`
  font-size: 14px;
  color: #212121;
  line-height: 1.5;
  word-break: break-word;
`;

const FieldValueMono = styled(FieldValue)`
  font-family: 'Roboto Mono', 'Menlo', monospace;
  background-color: #f5f5f5;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-size: 12px;
`;

const KeywordContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordBadge = styled.span`
  display: inline-block;
  background-color: #e8f1fb;
  color: #1a73e8;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
`;

const GuidelineText = styled.div`
  background-color: #f5f5f5;
  border-left: 3px solid #005bac;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #212121;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 24px;
`;

const MetaItem = styled.div`
  font-size: 13px;
`;

const MetaLabel = styled.span`
  font-weight: 600;
  color: #6e6e6e;
`;

const MetaValue = styled.span`
  color: #212121;
  margin-left: 8px;
  font-family: 'Roboto Mono', monospace;
  word-break: break-all;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  min-height: 40px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${(props: { variant?: 'primary' | 'secondary' | 'danger' }) => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #005bac;
          color: #ffffff;
          &:hover {
            background-color: #00437f;
          }
        `;
      case 'danger':
        return `
          background-color: #c62828;
          color: #ffffff;
          &:hover {
            background-color: #9b1f20;
          }
        `;
      default:
        return `
          background-color: #ffffff;
          color: #005bac;
          border: 1px solid #005bac;
          &:hover {
            background-color: #e8f1fb;
          }
        `;
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6e6e6e;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  padding: 20px;
  background-color: #ffebee;
  border-left: 4px solid #c62828;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
`;

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
`;

const DialogContent = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 24px;
  max-width: 400px;
  width: 100%;
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
  margin: 0 0 24px 0;
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

// ─────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: '초안',
    APPROVED: '승인됨',
    DEPRECATED: '사용 중단',
  };
  return labels[status] || status;
};

// ─────────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  topic: string;
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
          "{topic}"
          <br />
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

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const ManualDraftDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ draftId: string }>();
  const draftId = params.draftId || '';

  const [detail, setDetail] = useState<ManualDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getManualDetail(draftId);
        setDetail(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '상세 정보를 불러올 수 없습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (draftId) {
      fetchDetail();
    }
  }, [draftId]);

  // Handle back
  const handleBack = () => {
    navigate('/manuals/drafts');
  };

  // Handle consultation link
  const handleConsultationClick = () => {
    if (detail?.source_consultation_id) {
      navigate(`/consultations/${detail.source_consultation_id}`);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!detail) return;

    try {
      setDeleting(true);
      const { deleteManualDraft } = await import('@/lib/api/manuals');
      await deleteManualDraft(detail.id);
      navigate('/manuals/drafts', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>불러오는 중...</LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !detail) {
    return (
      <PageContainer>
        <PageHeader>
          <HeaderLeft>
            <BackButton onClick={handleBack}>←</BackButton>
            <PageTitle>메뉴얼 초안 상세</PageTitle>
          </HeaderLeft>
        </PageHeader>
        <ErrorContainer>{error || '상세 정보를 불러올 수 없습니다.'}</ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderLeft>
          <BackButton onClick={handleBack}>←</BackButton>
          <PageTitle>메뉴얼 초안 상세</PageTitle>
        </HeaderLeft>
        <ActionBar>
          {detail.status === 'DRAFT' && (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
              삭제
            </Button>
          )}
          <Button variant="secondary" onClick={handleConsultationClick}>
            원본 상담 열기
          </Button>
        </ActionBar>
      </PageHeader>

      {/* Content */}
      <ContentCard>
        {/* Meta Info */}
        <MetaInfo>
          <MetaItem>
            <MetaLabel>상태:</MetaLabel>
            <MetaValue>{getStatusLabel(detail.status)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>생성일:</MetaLabel>
            <MetaValue>{formatDate(detail.created_at)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>수정일:</MetaLabel>
            <MetaValue>{formatDate(detail.updated_at)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>ID:</MetaLabel>
            <MetaValue>{detail.id.substring(0, 8)}...</MetaValue>
          </MetaItem>
        </MetaInfo>

        {/* Topic */}
        <FieldGroup>
          <FieldLabel>주제</FieldLabel>
          <FieldValue>{detail.topic}</FieldValue>
        </FieldGroup>

        {/* Keywords */}
        <FieldGroup>
          <FieldLabel>키워드</FieldLabel>
          <KeywordContainer>
            {detail.keywords.map((keyword: string, idx: number) => (
              <KeywordBadge key={idx}>{keyword}</KeywordBadge>
            ))}
          </KeywordContainer>
        </FieldGroup>

        {/* Business Type & Error Code */}
        <FieldGroup>
          <FieldLabel>업무 구분 & 에러 코드</FieldLabel>
          <FieldValue>
            {detail.business_type_name || '-'} / {detail.error_code || '-'}
          </FieldValue>
        </FieldGroup>

        {/* Background */}
        <FieldGroup>
          <FieldLabel>배경 정보</FieldLabel>
          <GuidelineText>{detail.background}</GuidelineText>
        </FieldGroup>

        {/* Guideline */}
        <FieldGroup>
          <FieldLabel>조치사항 / 가이드라인</FieldLabel>
          <GuidelineText>{detail.guideline}</GuidelineText>
        </FieldGroup>

        {/* Version ID */}
        {detail.version_id && (
          <FieldGroup>
            <FieldLabel>버전 ID</FieldLabel>
            <FieldValueMono>{detail.version_id}</FieldValueMono>
          </FieldGroup>
        )}

        {/* Source Consultation ID */}
        <FieldGroup>
          <FieldLabel>원본 상담 ID</FieldLabel>
          <FieldValueMono>{detail.source_consultation_id}</FieldValueMono>
        </FieldGroup>
      </ContentCard>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          topic={detail.topic}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </PageContainer>
  );
};

export default ManualDraftDetailPage;

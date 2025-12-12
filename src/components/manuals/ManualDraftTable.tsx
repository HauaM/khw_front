/**
 * 메뉴얼 초안 테이블 컴포넌트
 *
 * 필수 컬럼:
 * - topic
 * - keywords
 * - business_type_name
 * - error_code
 * - created_at
 * - status
 * - source_consultation_id
 * - actions (상세보기, 삭제)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ManualDraftListResponse } from '@/lib/api/manuals';

// ─────────────────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────────────────

const TableCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 20px;
`;

const TableTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0;
`;

const TableCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #6e6e6e;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background-color: #e8f1fb;
  }

  th {
    background-color: #e8f1fb;
    color: #005bac;
    font-size: 13px;
    font-weight: 600;
    padding: 12px 12px;
    text-align: left;
    border-bottom: 1px solid #bdbdbd;
    white-space: nowrap;
  }

  td {
    font-size: 13px;
    color: #212121;
    padding: 12px 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6e6e6e;
`;

const NoDataIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #bdbdbd;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoDataTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #424242;
  margin: 0 0 8px 0;
`;

const NoDataDescription = styled.p`
  font-size: 13px;
  color: #6e6e6e;
  margin: 0;
`;

const KeywordBadge = styled.span`
  display: inline-block;
  background-color: #e8f1fb;
  color: #1a73e8;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  margin-right: 4px;

  &:last-child {
    margin-right: 0;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  white-space: nowrap;

  ${(props: { status: string }) => {
    switch (props.status) {
      case 'DRAFT':
        return `
          background-color: #f5f5f5;
          color: #6e6e6e;
        `;
      case 'APPROVED':
        return `
          background-color: #e8f5e9;
          color: #2e7d32;
        `;
      case 'DEPRECATED':
        return `
          background-color: #ffebee;
          color: #c62828;
        `;
      default:
        return `
          background-color: #f5f5f5;
          color: #6e6e6e;
        `;
    }
  }}
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  min-height: 28px;
  padding: 2px 8px;
  margin-right: 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${(props: { danger?: boolean }) =>
    props.danger
      ? `
    background-color: #ffebee;
    color: #c62828;
    &:hover {
      background-color: #c62828;
      color: #ffffff;
    }
  `
      : `
    background-color: #e8f1fb;
    color: #005bac;
    &:hover {
      background-color: #005bac;
      color: #ffffff;
    }
  `}
`;

const ConsultationLink = styled.a`
  color: #1a73e8;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
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

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

interface ManualDraftTableProps {
  drafts: ManualDraftListResponse[];
  totalCount: number;
  onSelectDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string, topic: string) => void;
}

const ManualDraftTable: React.FC<ManualDraftTableProps> = ({
  drafts,
  totalCount,
  onSelectDraft,
  onDeleteDraft,
}) => {
  const navigate = useNavigate();

  const handleConsultationClick = (e: React.MouseEvent<HTMLAnchorElement>, consultationId: string): void => {
    e.stopPropagation();
    // TODO: /consultations/{id} 경로로 이동
    navigate(`/consultations/${consultationId}`);
  };

  const handleDetailClick = (draftId: string): void => {
    onSelectDraft(draftId);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, draftId: string, topic: string): void => {
    e.stopPropagation();
    onDeleteDraft(draftId, topic);
  };

  return (
    <TableCard>
      <TableHeader>
        <TableTitle>메뉴얼 초안 목록</TableTitle>
        <TableCount>총 {totalCount}건</TableCount>
      </TableHeader>

      <TableContainer>
        {drafts.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>주제</th>
                <th>키워드</th>
                <th>업무 구분</th>
                <th>에러 코드</th>
                <th>생성 일시</th>
                <th>상태</th>
                <th>원본 상담</th>
                <th style={{ textAlign: 'center' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.id}>
                  {/* Topic */}
                  <td title={draft.topic} style={{ maxWidth: '200px' }}>
                    {truncateText(draft.topic, 50)}
                  </td>

                  {/* Keywords */}
                  <td style={{ maxWidth: '180px' }}>
                    {draft.keywords.slice(0, 2).map((keyword: string, idx: number) => (
                      <KeywordBadge key={idx}>{keyword}</KeywordBadge>
                    ))}
                    {draft.keywords.length > 2 && (
                      <KeywordBadge>+{draft.keywords.length - 2}</KeywordBadge>
                    )}
                  </td>

                  {/* Business Type */}
                  <td>{draft.business_type_name || '-'}</td>

                  {/* Error Code */}
                  <td style={{ fontFamily: 'monospace' }}>{draft.error_code || '-'}</td>

                  {/* Created At */}
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(draft.created_at)}</td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={draft.status}>{draft.status}</StatusBadge>
                  </td>

                  {/* Source Consultation */}
                  <td>
                    <ConsultationLink
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        handleConsultationClick(e, draft.source_consultation_id)
                      }
                    >
                      {truncateText(draft.source_consultation_id, 12)}
                    </ConsultationLink>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <ActionButton onClick={() => handleDetailClick(draft.id)}>
                      상세보기
                    </ActionButton>
                    {draft.status === 'DRAFT' && (
                      <ActionButton
                        danger
                        onClick={(e) => handleDeleteClick(e, draft.id, draft.topic)}
                      >
                        삭제
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataContainer>
            <NoDataIcon>📋</NoDataIcon>
            <NoDataTitle>초안이 없습니다</NoDataTitle>
            <NoDataDescription>필터 조건을 변경해보세요</NoDataDescription>
          </NoDataContainer>
        )}
      </TableContainer>
    </TableCard>
  );
};

export default ManualDraftTable;

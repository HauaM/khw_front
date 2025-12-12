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
import { ManualDraftListResponse } from '@/lib/api/manuals';

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
}

const ManualDraftTable: React.FC<ManualDraftTableProps> = ({
  drafts,
  totalCount,
  onSelectDraft,
}) => {
  const navigate = useNavigate();

  const handleConsultationClick = (e: React.MouseEvent<HTMLAnchorElement>, consultationId: string): void => {
    e.stopPropagation();
    // TODO: /consultations/{id} 경로로 이동
    navigate(`/consultations/${consultationId}`);
  };

  const handleRowClick = (draftId: string): void => {
    onSelectDraft(draftId);
  };

  // 상태별 배지 색상
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-600';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'DEPRECATED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900 m-0">메뉴얼 초안 목록</h3>
        <span className="text-xs font-semibold text-gray-600">총 {totalCount}건</span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {drafts.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">주제</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">키워드</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">업무 구분</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">에러 코드</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">생성 일시</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">상태</th>
                <th className="bg-blue-50 text-primary-500 text-xs font-semibold px-3 py-3 text-left border-b border-gray-300 whitespace-nowrap">원본 상담</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr
                  key={draft.id}
                  onClick={() => handleRowClick(draft.id)}
                  className="cursor-pointer transition-colors duration-200 hover:bg-gray-100 border-b border-gray-200"
                >
                  {/* Topic */}
                  <td className="text-xs text-gray-900 px-3 py-3 max-w-[200px]" title={draft.topic}>
                    {truncateText(draft.topic, 50)}
                  </td>

                  {/* Keywords */}
                  <td className="text-xs text-gray-900 px-3 py-3 max-w-[180px]">
                    {draft.keywords.slice(0, 2).map((keyword: string, idx: number) => (
                      <span key={idx} className="inline-block bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 text-xs font-medium mr-1">
                        {keyword}
                      </span>
                    ))}
                    {draft.keywords.length > 2 && (
                      <span className="inline-block bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 text-xs font-medium">
                        +{draft.keywords.length - 2}
                      </span>
                    )}
                  </td>

                  {/* Business Type */}
                  <td className="text-xs text-gray-900 px-3 py-3">{draft.business_type_name || '-'}</td>

                  {/* Error Code */}
                  <td className="text-xs text-gray-900 px-3 py-3 font-mono">{draft.error_code || '-'}</td>

                  {/* Created At */}
                  <td className="text-xs text-gray-900 px-3 py-3 whitespace-nowrap">{formatDate(draft.created_at)}</td>

                  {/* Status */}
                  <td className="text-xs text-gray-900 px-3 py-3">
                    <span className={`inline-block rounded-full text-xs font-semibold px-2 py-0.5 whitespace-nowrap ${getStatusBadgeClasses(draft.status)}`}>
                      {draft.status}
                    </span>
                  </td>

                  {/* Source Consultation */}
                  <td className="text-xs px-3 py-3">
                    <a
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        handleConsultationClick(e, draft.source_consultation_id)
                      }
                      className="text-blue-500 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                    >
                      {truncateText(draft.source_consultation_id, 12)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center px-5 py-15">
            <div className="mb-4 text-6xl text-gray-300 flex items-center justify-center w-16 h-16">📋</div>
            <h4 className="text-base font-semibold text-gray-700 mb-2 m-0">초안이 없습니다</h4>
            <p className="text-xs text-gray-600 m-0">필터 조건을 변경해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualDraftTable;

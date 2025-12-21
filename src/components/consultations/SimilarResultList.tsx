import React from 'react';
import { SimilarConsultationResult } from '@/lib/api/consultations';

interface SimilarResultListProps {
  results: SimilarConsultationResult[];
  onSelect: (result: SimilarConsultationResult) => void;
  selectedRank?: number;
}

/**
 * 관련 메뉴얼 Top-2/3 리스트
 *
 * - 각 항목 클릭 시 Top-1 상세 뷰로 승격
 * - 선택된 항목 하이라이트
 */
const SimilarResultList: React.FC<SimilarResultListProps> = ({
  results,
  onSelect,
  selectedRank,
}) => {
  if (!results || results.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-semibold text-gray-900">다른 관련 메뉴얼</h5>
      {results.map((result) => {
        const isSelected = selectedRank === result.rank;
        const subject = result.subject || result.metadata_fields?.manual_topic || result.inquiry_text;
        const keywords = result.keywords || [];
        return (
          <div
            key={result.consultation_id}
            onClick={() => onSelect(result)}
            className={`cursor-pointer rounded-md border p-3 transition ${
              isSelected
                ? 'border-primary-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                Top-{result.rank}
              </span>
              <span className="text-xs text-gray-600">유사도: {result.score}%</span>
            </div>

            <p className="mb-2 text-sm font-semibold text-gray-900">
              {subject}
            </p>

            {keywords.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1">
                {keywords.slice(0, 3).map((keyword, idx) => (
                  <span
                    key={`${keyword}-${idx}`}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>업무: {result.business_type || '-'}</span>
              <span>에러: {result.error_code || '-'}</span>
              <span>{formatDate(result.created_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SimilarResultList;

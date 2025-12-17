import React, { useMemo } from 'react';
import type { ManualCardItem } from '@/types/manuals';

interface ApprovedManualCardProps {
  manual: ManualCardItem;
  isHighlighted: boolean;
  onViewConsultation: () => void;
}

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return value;
  }
};

const ApprovedManualCard: React.FC<ApprovedManualCardProps> = ({ manual, isHighlighted, onViewConsultation }) => {
  const guidelineSteps = useMemo(
    () =>
      manual.guideline
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [manual.guideline]
  );

  return (
    <div
      id={`manual-${manual.id}`}
      className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
        isHighlighted ? 'border-primary-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3 mb-4">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success">
              {manual.status === 'APPROVED' ? '승인' : manual.status}
            </span>
            <h3 className="text-base font-semibold text-gray-900">{manual.topic}</h3>
          </div>
          <p className="text-xs text-gray-400 font-mono">ID: {manual.id}</p>
        </div>
        <button
          type="button"
          onClick={onViewConsultation}
          title="상담 원본 보기"
          className="rounded-md p-1.5 text-primary-500 transition hover:bg-primary-50"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-xs font-semibold text-gray-700">키워드</p>
        <div className="flex flex-wrap gap-2">
          {manual.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-info-light px-2 py-0.5 text-xs font-semibold text-info"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700">배경</p>
        <p className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
          {manual.background}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700">처리 가이드라인</p>
        <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <ol className="space-y-2 pl-4 text-sm text-gray-900">
            {guidelineSteps.map((step, index) => (
              <li key={`${manual.id}-step-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
        <span>최종 수정 {formatDateTime(manual.updated_at)}</span>
        <span className="text-gray-300">•</span>
        <span>생성 {formatDateTime(manual.created_at)}</span>
      </div>
    </div>
  );
};

export default ApprovedManualCard;

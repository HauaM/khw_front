import React from 'react';
import type { ConsultationDetail } from '@/types/consultations';

interface ConsultationModalProps {
  isOpen: boolean;
  consultation: ConsultationDetail | null;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
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

const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  consultation,
  isLoading,
  error,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-xl font-semibold text-gray-900">상담 원본 정보</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="모달 닫기"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-600">
            상담 정보를 불러오는 중입니다...
          </p>
        )}

        {!isLoading && error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-700">
            상담 정보를 불러오는 중 오류가 발생했습니다. {error.message}
          </p>
        )}

        {!isLoading && !error && consultation && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">상담 요약</p>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                {consultation.summary}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">문의 내용</p>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                {consultation.inquiry}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">조치 내역</p>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="whitespace-pre-line text-sm text-gray-900">{consultation.action}</p>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-700">상담 ID</p>
              <p className="mt-1 text-xs text-gray-900">{consultation.id}</p>
              <p className="mt-2 text-xs text-gray-500">
                생성일: {formatDateTime(consultation.created_at)}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && !consultation && (
          <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-600">
            상담 정보를 찾을 수 없습니다.
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualReviewDetail } from '@/types/reviews';
import { useToast } from '@/components/common/Toast';
import Modal from '@/components/common/Modal';
import { useApproveManualReview } from '@/hooks/useApproveManualReview';
import { useRejectManualReview } from '@/hooks/useRejectManualReview';

interface ManualReviewDetailViewProps {
  detail: ManualReviewDetail;
}

const ManualReviewDetailView: React.FC<ManualReviewDetailViewProps> = ({
  detail,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { isLoading: isApproving, mutate: mutateApprove } =
    useApproveManualReview({
      onSuccess: () => {
        showToast(
          '메뉴얼이 승인되었습니다. 신규 메뉴얼이 등록됩니다.',
          'success'
        );
        setTimeout(() => {
          navigate('/reviews/tasks');
        }, 2000);
      },
      onError: () => {
        showToast(
          '승인 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
          'error'
        );
      },
    });

  const { isLoading: isRejecting, mutate: mutateReject } =
    useRejectManualReview({
      onSuccess: () => {
        setShowRejectModal(false);
        showToast(
          '메뉴얼이 반려되었습니다. 작성자에게 알림이 전송됩니다.',
          'success'
        );
        setTimeout(() => {
          navigate('/reviews/tasks');
        }, 2000);
      },
      onError: () => {
        showToast(
          '반려 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
          'error'
        );
      },
    });

  const isSubmitting = isApproving || isRejecting;

  const handleBackToList = () => {
    navigate('/reviews/tasks');
  };

  const handleApprove = async () => {
    await mutateApprove(detail.task_id);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('반려 사유를 입력해주세요.', 'error');
      return;
    }
    await mutateReject(detail.task_id, rejectReason);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const highlightChanges = (text: string): string => {
    const keywords = ['공동인증서', 'v3.2.5', 'iOS 16', 'Android', '백업', '복원'];
    let highlighted = text;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, 'g');
      highlighted = highlighted.replace(
        regex,
        `<span class="bg-yellow-300 px-1 rounded font-semibold">$1</span>`
      );
    });

    return highlighted;
  };

  const getStatusBadgeColor = () => {
    switch (detail.status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'DONE':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (detail.status) {
      case 'IN_PROGRESS':
        return '검토중';
      case 'DONE':
        return '완료';
      case 'REJECTED':
        return '반려';
      default:
        return '대기중';
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={handleBackToList}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              검토 Task 목록
            </button>
            <span className="text-gray-400">/</span>
            <span>상세</span>
          </div>
          <h2 className="mb-1 text-2xl font-bold text-gray-900">
            메뉴얼 검토 상세
          </h2>
          <span className="font-mono text-xs font-medium text-blue-700">
            {detail.task_id}
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor()}`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Info Card */}
      <div className="mb-6 flex flex-wrap gap-6 rounded-lg bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">비교 항목</span>
          <span className="text-sm text-gray-900">
            {detail.old_entry_id ? `${detail.old_entry_id.slice(0, 8)}...` : 'N/A'} →{' '}
            {detail.new_entry_id.slice(0, 8)}...
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">유사도</span>
          <span className="text-sm text-gray-900">
            {(detail.similarity * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">생성일시</span>
          <span className="text-sm text-gray-900">
            {formatDate(detail.created_at)}
          </span>
        </div>
      </div>

      {/* Diff Summary Card */}
      {detail.diff_text && (
        <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-yellow-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <h3 className="m-0 text-sm font-semibold text-gray-900">
              변경 사항 요약 (AI 분석)
            </h3>
          </div>
          <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {detail.diff_text}
          </p>
        </div>
      )}

      {/* Comparison Container */}
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {/* Old Manual Panel */}
        {detail.old_manual ? (
          <div className="flex flex-col rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-red-700 bg-red-50 px-5 py-4">
              <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-red-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                기존 메뉴얼
              </h3>
              <span className="bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                {detail.old_manual.id.slice(0, 8)}...
              </span>
            </div>
            <div className="space-y-6 px-5 py-4">
              <FieldSection
                label="Topic"
                content={detail.old_manual.topic}
                isHighlighted={false}
              />
              <FieldSection
                label="Background"
                content={detail.old_manual.background}
                isHighlighted={false}
              />
              <FieldSection
                label="Guideline"
                content={detail.old_manual.guideline}
                isHighlighted={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-lg bg-white shadow-sm">
            <div className="border-b-2 border-red-700 bg-red-50 px-5 py-4">
              <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-red-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                기존 메뉴얼
              </h3>
            </div>
            <div className="flex items-center justify-center px-5 py-12 text-sm text-gray-500">
              {detail.old_manual_summary ? (
                <p className="whitespace-pre-wrap">{detail.old_manual_summary}</p>
              ) : (
                'AI 분석 요약'
              )}
            </div>
          </div>
        )}

        {/* New Manual Panel */}
        {detail.new_manual ? (
          <div className="flex flex-col rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-green-700 bg-green-50 px-5 py-4">
              <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-green-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                신규 초안
              </h3>
              <span className="bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                {detail.new_manual.id.slice(0, 8)}...
              </span>
            </div>
            <div className="space-y-6 px-5 py-4">
              <FieldSection
                label="Topic"
                content={detail.new_manual.topic}
                isHighlighted={true}
                highlightedContent={highlightChanges(detail.new_manual.topic)}
              />
              <FieldSection
                label="Background"
                content={detail.new_manual.background}
                isHighlighted={true}
                highlightedContent={highlightChanges(detail.new_manual.background)}
              />
              <FieldSection
                label="Guideline"
                content={detail.new_manual.guideline}
                isHighlighted={true}
                highlightedContent={highlightChanges(detail.new_manual.guideline)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-lg bg-white shadow-sm">
            <div className="border-b-2 border-green-700 bg-green-50 px-5 py-4">
              <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-green-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                신규 초안
              </h3>
            </div>
            <div className="flex items-center justify-center px-5 py-12 text-sm text-gray-500">
              {detail.new_manual_summary ? (
                <p className="whitespace-pre-wrap">{detail.new_manual_summary}</p>
              ) : (
                'AI 분석 요약'
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="text-sm text-gray-600">
          검토를 완료하고 승인 또는 반려를 선택해주세요
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBackToList}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md border border-gray-400 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            목록으로
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md border border-red-700 bg-white px-6 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            반려
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isApproving ? '처리중...' : '승인'}
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        title="메뉴얼 반려"
        onCancel={() => !isSubmitting && setShowRejectModal(false)}
        onConfirm={handleReject}
        cancelText="취소"
        confirmText={isRejecting ? '처리중...' : '반려 확정'}
        disableConfirm={isSubmitting || !rejectReason.trim()}
        disableCancel={isSubmitting}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700">
              반려 사유 <span className="text-red-600">*</span>
            </label>
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={isSubmitting}
            placeholder="반려 사유를 상세히 입력해주세요.

예시:
- 가이드라인 3번 항목의 절차가 불명확합니다.
- 최신 앱 버전 정보를 확인 후 수정이 필요합니다."
            className="min-h-[160px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal leading-relaxed text-gray-900 transition placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <p className="m-0 text-xs text-gray-600">
            작성자에게 반려 사유가 전달되며, 수정 후 재검토를 요청할 수 있습니다.
          </p>
        </div>
      </Modal>
    </>
  );
};

interface FieldSectionProps {
  label: string;
  content: string;
  isHighlighted?: boolean;
  highlightedContent?: string;
}

const FieldSection: React.FC<FieldSectionProps> = ({
  label,
  content,
  isHighlighted = false,
  highlightedContent,
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    Topic: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    Background: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    Guideline: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  };

  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
        {iconMap[label]}
        {label}
      </h4>
      {isHighlighted && highlightedContent ? (
        <div
          className="min-h-[60px] whitespace-pre-wrap rounded-md border border-yellow-300 bg-yellow-50 px-3 py-3 text-sm leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      ) : (
        <div className="min-h-[60px] whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-relaxed text-gray-800">
          {content}
        </div>
      )}
    </div>
  );
};

export default ManualReviewDetailView;

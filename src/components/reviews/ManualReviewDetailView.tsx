import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualReviewComparison } from '@/types/reviews';
import { ApiFeedback } from '@/types/api';
import { useToast } from '@/components/common/Toast';
import Modal from '@/components/common/Modal';
import { useApproveManualReview } from '@/hooks/useApproveManualReview';
import { useRejectManualReview } from '@/hooks/useRejectManualReview';
import { getCurrentReviewerId } from '@/lib/api/auth';

interface ManualReviewDetailViewProps {
  detail: ManualReviewComparison;
  feedback?: ApiFeedback[];
}

const ManualReviewDetailView: React.FC<ManualReviewDetailViewProps> = ({
  detail,
  feedback = [],
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { isPending: isApproving, mutate: mutateApprove } =
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

  const { isPending: isRejecting, mutate: mutateReject } =
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

  const handleApprove = () => {
    // 현재 로그인한 사용자의 ID를 JWT 토큰에서 추출
    const reviewerId = getCurrentReviewerId();

    if (!reviewerId) {
      showToast('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.', 'error');
      return;
    }

    const taskId = detail.review_task_id;
    if (!taskId) {
      showToast('Task ID를 찾을 수 없습니다.', 'error');
      return;
    }

    mutateApprove({ taskId, employeeId: reviewerId });
  };

  const handleReject = () => {
    const taskId = detail.review_task_id;
    if (!taskId) {
      showToast('Task ID를 찾을 수 없습니다.', 'error');
      return;
    }
    mutateReject({ taskId, reviewNotes: rejectReason });
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

  const highlightChanges = (text: string | undefined): string => {
    if (!text) return '';

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
      case 'TODO':
        return 'bg-gray-100 text-gray-700';
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
      case 'TODO':
        return '대기중';
      case 'IN_PROGRESS':
        return '검토중';
      case 'DONE':
        return '완료';
      case 'REJECTED':
        return '반려';
      default:
        return '알 수 없음';
    }
  };

  // AI 분석 피드백 추출
  const aiAnalysis = feedback.find(
    (f) => f.code === 'AI_ANALYSIS_RESULT' || f.code === 'AI_COMPARISON_SUMMARY'
  );

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
            {detail.review_task_id || 'N/A'}
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
          <span className="text-xs font-semibold text-gray-600">비교 유형</span>
          <span className="text-sm text-gray-900">
            {detail.comparison_type === 'similar' && '유사'}
            {detail.comparison_type === 'supplement' && '보완'}
            {detail.comparison_type === 'new' && '신규'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">유사도</span>
          <span className="text-sm text-gray-900">
            {(detail.similarity_score * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">생성일시</span>
          <span className="text-sm text-gray-900">
            {formatDate(detail.created_at)}
          </span>
        </div>
      </div>

      {/* AI Analysis Card */}
      {aiAnalysis && (
        <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
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
              AI 분석 결과
            </h3>
          </div>
          <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {aiAnalysis.message}
          </p>
        </div>
      )}

      {/* Comparison Container */}
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {/* Existing Manual Panel */}
        {detail.existing_manual ? (
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
                {detail.existing_manual.id.slice(0, 8)}...
              </span>
            </div>
            <div className="space-y-6 px-5 py-4">
              <FieldSection
                label="Keywords"
                content={detail.existing_manual.keywords?.join(', ')}
                isHighlighted={false}
              />
              <FieldSection
                label="Topic"
                content={detail.existing_manual.topic}
                isHighlighted={false}
              />
              <FieldSection
                label="Background"
                content={detail.existing_manual.background}
                isHighlighted={false}
              />
              <FieldSection
                label="Guideline"
                content={detail.existing_manual.guideline}
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
              신규 메뉴얼 (기존 메뉴얼 없음)
            </div>
          </div>
        )}

        {/* Draft Entry Panel */}
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
              {detail.draft_entry.id.slice(0, 8)}...
            </span>
          </div>
          <div className="space-y-6 px-5 py-4">
            <FieldSection
              label="Keywords"
              content={detail.draft_entry.keywords?.join(', ')}
              isHighlighted={true}
              highlightedContent={highlightChanges(detail.draft_entry.keywords?.join(', '))}
            />
            <FieldSection
              label="Topic"
              content={detail.draft_entry.topic}
              isHighlighted={true}
              highlightedContent={highlightChanges(detail.draft_entry.topic)}
            />
            <FieldSection
              label="Background"
              content={detail.draft_entry.background}
              isHighlighted={true}
              highlightedContent={highlightChanges(detail.draft_entry.background)}
            />
            <FieldSection
              label="Guideline"
              content={detail.draft_entry.guideline}
              isHighlighted={true}
              highlightedContent={highlightChanges(detail.draft_entry.guideline)}
            />
          </div>
        </div>
      </div>

      {/* Action Bar - 대기중, 검토중 상태일 때만 표시 */}
      {(detail.status === 'TODO' || detail.status === 'IN_PROGRESS') && (
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
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        title="메뉴얼 반려"
        onCancel={() => !isSubmitting && setShowRejectModal(false)}
        onConfirm={handleReject}
        cancelText="취소"
        confirmText={isRejecting ? '처리중...' : '반려 확정'}
        disableConfirm={isSubmitting || rejectReason.trim().length < 10}
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
          <div className="flex items-center justify-between">
            <p className="m-0 text-xs text-gray-600">
              작성자에게 반려 사유가 전달되며, 수정 후 재검토를 요청할 수 있습니다.
            </p>
            <span
              className={`text-xs font-medium ${
                rejectReason.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {rejectReason.trim().length}/10
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

interface FieldSectionProps {
  label: string;
  content: string | undefined;
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
    Keywords: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
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

  // content가 없을 때 기본 메시지 표시
  const displayContent = content || '(내용 없음)';

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
          {displayContent}
        </div>
      )}
    </div>
  );
};

export default ManualReviewDetailView;

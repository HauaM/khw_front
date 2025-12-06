import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualDraft } from '@/types/manuals';
import { useToast } from '@/components/common/Toast';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import { useSaveManualDraft } from '@/hooks/useSaveManualDraft';
import { useRequestManualReview } from '@/hooks/useRequestManualReview';
import { guidelinesToString } from '@/lib/api/manuals';

interface ManualDraftResultViewProps {
  draft: ManualDraft;
  onSaved?: (updatedDraft: ManualDraft) => void;
}

/**
 * 메뉴얼 초안 결과 뷰 컴포넌트
 * - 초안 조회, 수정, 저장, 검토 요청 기능을 담당합니다.
 */
const ManualDraftResultView: React.FC<ManualDraftResultViewProps> = ({ draft, onSaved }) => {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const { mutate: saveDraft } = useSaveManualDraft();
  const { mutate: requestReview, isLoading: isReviewLoading } = useRequestManualReview();

  // 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDraft, setEditedDraft] = useState<ManualDraft>(draft);
  const [newKeyword, setNewKeyword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 편집 모드 진입
  const handleEditClick = () => {
    setEditedDraft({ ...draft });
    setIsEditMode(true);
  };

  // 편집 모드 취소
  const handleCancelEdit = () => {
    setEditedDraft({ ...draft });
    setNewKeyword('');
    setIsEditMode(false);
  };

  // 초안 저장
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updatedDraft = await saveDraft(draft.id, {
        topic: editedDraft.topic,
        keywords: editedDraft.keywords,
        background: editedDraft.background,
        // guideline 배열을 줄바꿈으로 구분된 문자열로 변환
        guideline: guidelinesToString(editedDraft.guideline),
      });

      // 부모 컴포넌트에 업데이트된 draft 전달
      if (onSaved) {
        onSaved(updatedDraft);
      }

      setIsEditMode(false);
      showToast('메뉴얼 초안이 저장되었습니다.', 'success');
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast('저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 키워드 추가
  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !editedDraft.keywords.includes(trimmed)) {
      setEditedDraft({
        ...editedDraft,
        keywords: [...editedDraft.keywords, trimmed],
      });
      setNewKeyword('');
    }
  };

  // 키워드 삭제
  const handleRemoveKeyword = (keyword: string) => {
    setEditedDraft({
      ...editedDraft,
      keywords: editedDraft.keywords.filter((k) => k !== keyword),
    });
  };

  // 키워드 입력에서 Enter 누르기
  const handleKeywordInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // 검토 요청 클릭
  const handleRequestReview = () => {
    setShowConfirmModal(true);
  };

  // 검토 요청 확인
  const handleConfirmReview = async () => {
    setShowConfirmModal(false);

    try {
      // OpenAPI: POST /api/v1/manuals/{manual_id}/review
      await requestReview(draft.id);

      showToast(
        '검토 요청이 완료되었습니다. 검토자에게 알림이 전송되었습니다.',
        'success'
      );

      // 2초 후 검토 작업 목록 페이지로 이동
      setTimeout(() => {
        navigate('/reviews/tasks');
      }, 2000);
    } catch (error) {
      console.error('Error requesting review:', error);
      showToast('검토 요청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
  };

  // 모달 취소
  const handleCancelModal = () => {
    setShowConfirmModal(false);
  };

  // 현재 데이터 (보기 모드: draft, 편집 모드: editedDraft)
  const currentDraft = isEditMode ? editedDraft : draft;

  // 상태 배지 스타일
  // OpenAPI: ManualStatus = 'DRAFT' | 'APPROVED' | 'DEPRECATED'
  const getStatusBadgeStyle = () => {
    switch (draft.status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border border-green-300';
      case 'DEPRECATED':
        return 'bg-red-50 text-red-700 border border-red-300';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-300';
    }
  };

  // 상태 배지 텍스트
  const getStatusBadgeText = () => {
    switch (draft.status) {
      case 'APPROVED':
        return '승인됨';
      case 'DEPRECATED':
        return '폐기됨';
      case 'DRAFT':
      default:
        return '초안';
    }
  };

  // 가이드라인 항목에서 마커 제거
  const cleanGuidelineItem = (item: string): string => {
    return item.trim().replace(/^[-•*]\s*/, '');
  };

  return (
    <>
      {/* 토스트 컨테이너 */}
      <div className="fixed inset-0 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isOpen
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">메뉴얼 초안</h2>
          <p className="text-sm text-gray-600">
            LLM이 생성한 메뉴 초안을 검토하고 가져올 수 있습니다
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${getStatusBadgeStyle()}`}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          {getStatusBadgeText()}
        </div>
      </div>

      {/* 초안 카드 */}
      <div className="mb-6 rounded-lg bg-white p-7 shadow-sm">
        {/* 키워드 섹션 */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            키워드
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {currentDraft.keywords.map((keyword, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F1FB] px-3 py-1.5 text-xs font-semibold text-[#005BAC]"
              >
                {keyword}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="flex items-center transition hover:text-red-600"
                    aria-label="키워드 삭제"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditMode && (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 max-w-xs rounded-md border border-gray-300 px-3 text-sm focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="새 키워드 입력"
                style={{ minHeight: '36px' }}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordInputKeyPress}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="inline-flex items-center gap-1 rounded-md bg-[#005BAC] px-4 text-sm font-semibold text-white transition hover:bg-[#00437F]"
                style={{ minHeight: '36px' }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                추가
              </button>
            </div>
          )}
        </div>

        {/* 주제 섹션 */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            주제
          </div>

          {isEditMode ? (
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-lg font-semibold focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-blue-100"
              style={{ minHeight: '44px' }}
              value={editedDraft.topic}
              onChange={(e) => setEditedDraft({ ...editedDraft, topic: e.target.value })}
            />
          ) : (
            <h3 className="text-lg font-bold text-gray-900 leading-relaxed">{draft.topic}</h3>
          )}
        </div>

        {/* 배경 섹션 */}
        <div className="mb-8">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
            <svg className="h-5 w-5 text-[#005BAC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            배경
          </h4>

          {isEditMode ? (
            <textarea
              className="w-full rounded-md border border-gray-300 px-3.5 py-3 text-sm leading-relaxed focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-blue-100"
              style={{ minHeight: '120px', resize: 'vertical' }}
              value={editedDraft.background}
              onChange={(e) => setEditedDraft({ ...editedDraft, background: e.target.value })}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{draft.background}</p>
          )}
        </div>

        {/* 요소(가이드라인) 섹션 */}
        <div className="mb-8">
          <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
            <svg className="h-5 w-5 text-[#005BAC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            요소
          </h4>

          {isEditMode ? (
            <>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3.5 py-3 text-sm leading-relaxed focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                style={{ minHeight: '240px', resize: 'vertical' }}
                value={editedDraft.guideline.join('\n')}
                onChange={(e) =>
                  setEditedDraft({
                    ...editedDraft,
                    guideline: e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0),
                  })
                }
                placeholder="각 항목을 줄바꿈으로 구분하여 입력하세요"
              />
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>팁: 각 항목은 파란 점(•)으로 표시됩니다. 줄바꿈으로 항목을 구분하세요.</span>
              </div>
            </>
          ) : (
            <ul className="list-none space-y-3 p-0 m-0">
              {draft.guideline.map((item, index) => (
                <li key={index} className="relative pl-6 text-sm leading-relaxed text-gray-700">
                  <span
                    className="absolute left-1 top-2 h-1.5 w-1.5 rounded-full bg-[#005BAC]"
                    aria-hidden
                  />
                  {cleanGuidelineItem(item)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="min-h-[40px] rounded-md border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-[#005BAC] px-5 text-sm font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    저장하기
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#005BAC] bg-white px-5 text-sm font-semibold text-[#005BAC] transition hover:bg-[#E8F1FB]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                수정하기
              </button>
              <button
                type="button"
                onClick={handleRequestReview}
                disabled={isReviewLoading}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-[#005BAC] px-5 text-sm font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isReviewLoading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    검토 요청하기
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 검토 요청 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        title="검토 요청 확인"
        onCancel={handleCancelModal}
        onConfirm={handleConfirmReview}
        confirmText="요청하기"
        cancelText="취소"
        disableConfirm={isReviewLoading}
        disableCancel={isReviewLoading}
      >
        <p className="mb-0">
          이 메뉴얼 초안을 검토자에게 전송하시겠습니까?
          <br />
          검토 요청 후에는 검토자의 승인이 있어야 수정할 수 있습니다.
        </p>
      </Modal>
    </>
  );
};

export default ManualDraftResultView;

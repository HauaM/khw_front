import React, { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import {
  ManualDetail,
  ManualGuideline,
  ManualEditErrors,
  ManualUpdatePayload,
} from '@/types/manuals';
import {
  ChevronRightIcon,
  EditIcon,
  XIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
  DragHandleIcon,
} from '@/components/common/Icons';

interface ManualEditFormProps {
  formData: ManualDetail;
  guidelines: ManualGuideline[];
  keywordInput: string;
  errors: ManualEditErrors;
  isSaving: boolean;
  onKeywordInputChange: (value: string) => void;
  onInputChange: (field: keyof ManualUpdatePayload, value: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string) => void;
  onGuidelineChange: (index: number, field: keyof ManualGuideline, value: string) => void;
  onAddGuideline: () => void;
  onRemoveGuideline: (index: number) => void;
  onSubmit: () => Promise<boolean>;
}

/**
 * 메뉴얼 수정 폼 컴포넌트
 * - 메뉴얼 정보 편집 (주제, 키워드, 배경, 조치사항)
 * - 유효성 검사 에러 표시
 * - 저장/취소 버튼
 * - 네비게이션 (저장/취소 후 상세 페이지로 이동)
 */
const ManualEditForm: React.FC<ManualEditFormProps> = ({
  formData,
  guidelines,
  keywordInput,
  errors,
  isSaving,
  onKeywordInputChange,
  onInputChange,
  onAddKeyword,
  onRemoveKeyword,
  onGuidelineChange,
  onAddGuideline,
  onRemoveGuideline,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const manualId = formData.id;

  /**
   * 취소 버튼 클릭
   */
  const handleCancel = () => {
    showToast('수정이 취소되었습니다.', 'error');
    navigate(`/manuals/${manualId}`);
  };

  /**
   * 저장 버튼 클릭
   */
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await onSubmit();
    if (success) {
      showToast('메뉴얼이 성공적으로 저장되었습니다!', 'success');
      // 1초 후 상세 페이지로 이동
      setTimeout(() => {
        navigate(`/manuals/${manualId}`);
      }, 1000);
    }
  };

  /**
   * 키워드 입력 엔터 키 처리
   */
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddKeyword();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-0">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <a
              href="javascript:void(0)"
              onClick={handleCancel}
              className="text-[#005BAC] hover:text-[#00437F] hover:underline cursor-pointer"
            >
              메뉴얼 상세
            </a>
            <span className="text-gray-400">›</span>
            <span>메뉴얼 수정</span>
          </nav>

          {/* Title Row */}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">메뉴얼 수정</h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold font-mono">
              {manualId.substring(0, 8)}...
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-600">메뉴얼 정보를 수정하고 저장하세요</p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <XIcon className="w-4 h-4" />
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-5 rounded-md text-sm font-semibold text-white transition-colors relative ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#005BAC] hover:bg-[#00437F]'
            }`}
          >
            {!isSaving && (
              <>
                <EditIcon className="w-4 h-4" />
                저장하기
              </>
            )}
            {isSaving && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 mb-6 px-5 py-4 rounded-md border-l-4 bg-[#E8F5E9] border-[#2E7D32]">
        <InfoIcon className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-gray-700 leading-relaxed">
            변경사항을 저장하면 새로운 버전으로 기록됩니다. 이전 버전은 버전 비교 기능을 통해 확인할 수
            있습니다.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-5 mb-6 space-y-8">
        {/* Basic Information Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
            <EditIcon className="w-5 h-5 text-[#005BAC]" />
            <h3 className="text-base font-bold text-gray-900">기본 정보</h3>
          </div>

          {/* Topic Field */}
          <div className="mb-5">
            <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
              주제 <span className="text-red-600">*</span>
            </label>
            <input
              id="topic"
              type="text"
              className={`w-full min-h-[44px] border-2 rounded-md px-3 text-sm text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                errors.topic
                  ? 'border-red-600 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#1A73E8] focus:ring-[#1A73E8]/20'
              }`}
              value={formData.topic}
              onChange={(e) => onInputChange('topic', e.target.value)}
              placeholder="메뉴얼 주제를 입력하세요"
            />
            {errors.topic && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {errors.topic}
              </div>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
              상태 <span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              className="w-full min-h-[44px] border-2 border-gray-300 rounded-md px-3 text-sm text-gray-900 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-colors"
              value={formData.status}
              onChange={(e) => onInputChange('status', e.target.value)}
            >
              <option value="APPROVED">승인됨</option>
              <option value="DEPRECATED">사용 중단</option>
            </select>
            <p className="mt-1 text-xs text-gray-600">메뉴얼의 현재 상태를 선택하세요</p>
          </div>
        </div>

        {/* Keywords Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
            <PlusIcon className="w-5 h-5 text-[#005BAC]" />
            <h3 className="text-base font-bold text-gray-900">키워드</h3>
          </div>

          {/* Keyword Input */}
          <div className="mb-4">
            <label htmlFor="keywordInput" className="block text-sm font-semibold text-gray-700 mb-2">
              키워드 추가 <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="keywordInput"
                type="text"
                className="flex-1 min-h-[44px] border-2 border-gray-300 rounded-md px-3 text-sm text-gray-900 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-colors"
                value={keywordInput}
                onChange={(e) => onKeywordInputChange(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="키워드를 입력하고 Enter 또는 추가 버튼을 클릭하세요"
              />
              <button
                type="button"
                onClick={onAddKeyword}
                className="min-h-[44px] px-4 rounded-md bg-[#005BAC] text-sm font-semibold text-white hover:bg-[#00437F] transition-colors whitespace-nowrap"
              >
                추가
              </button>
            </div>
            {errors.keywords && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {errors.keywords}
              </div>
            )}
          </div>

          {/* Keyword List */}
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8F1FB] text-[#005BAC] text-xs font-semibold"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => onRemoveKeyword(keyword)}
                    className="p-0 w-4 h-4 flex items-center justify-center text-[#005BAC] hover:text-red-600 transition-colors"
                    aria-label={`${keyword} 삭제`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Background Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
            <EditIcon className="w-5 h-5 text-[#005BAC]" />
            <h3 className="text-base font-bold text-gray-900">배경 정보</h3>
          </div>

          <div>
            <label htmlFor="background" className="block text-sm font-semibold text-gray-700 mb-2">
              배경 설명 <span className="text-red-600">*</span>
            </label>
            <textarea
              id="background"
              className={`w-full min-h-[180px] border-2 rounded-md px-3 py-2 text-sm text-gray-900 font-normal resize-y focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors leading-relaxed ${
                errors.background
                  ? 'border-red-600 focus:border-red-600 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#1A73E8] focus:ring-[#1A73E8]/20'
              }`}
              value={formData.background}
              onChange={(e) => onInputChange('background', e.target.value)}
              placeholder="메뉴얼의 배경 정보를 상세히 입력하세요"
            />
            {errors.background && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {errors.background}
              </div>
            )}
          </div>
        </div>

        {/* Guidelines Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
            <CheckIcon className="w-5 h-5 text-[#005BAC]" />
            <h3 className="text-base font-bold text-gray-900">조치사항</h3>
          </div>

          {/* Guidelines List */}
          <ul className="space-y-3 mb-4">
            {guidelines.map((guideline: any, index: number) => (
              <li
                key={index}
                className="bg-gray-50 rounded-lg p-4 border-2 border-transparent focus-within:border-[#1A73E8]"
              >
                {/* Header: Drag handle, number, title input, delete button */}
                <div className="flex items-center gap-3 mb-3">
                  <DragHandleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#005BAC] text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className="flex-1 min-h-[44px] border-2 border-gray-300 rounded-md px-3 text-sm text-gray-900 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-colors"
                    value={guideline.title}
                    onChange={(e) => onGuidelineChange(index, 'title', e.target.value)}
                    placeholder="조치사항 제목"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveGuideline(index)}
                    className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    삭제
                  </button>
                </div>

                {/* Title Error */}
                {errors[`guideline_title_${index}`] && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                    {errors[`guideline_title_${index}`]}
                  </div>
                )}

                {/* Description Textarea */}
                <textarea
                  className="w-full min-h-[80px] border-2 border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 resize-y focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-colors leading-relaxed"
                  value={guideline.description}
                  onChange={(e) => onGuidelineChange(index, 'description', e.target.value)}
                  placeholder="조치사항 설명"
                />

                {/* Description Error */}
                {errors[`guideline_desc_${index}`] && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                    {errors[`guideline_desc_${index}`]}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Add Guideline Button */}
          <button
            type="button"
            onClick={onAddGuideline}
            className="w-full min-h-[48px] rounded-lg border-2 border-dashed border-gray-300 bg-white text-[#005BAC] text-sm font-semibold hover:bg-[#E8F1FB] hover:border-[#005BAC] transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            조치사항 추가
          </button>

          {/* Guidelines Error */}
          {errors.guidelines && (
            <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
              <AlertCircleIcon className="w-3.5 h-3.5" />
              {errors.guidelines}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default ManualEditForm;

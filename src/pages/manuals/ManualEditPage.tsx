import React from 'react';
import { useParams } from 'react-router-dom';
import { useManualEditForm } from '@/hooks/useManualEditForm';
import ManualEditForm from '@/components/manuals/ManualEditForm';

/**
 * 메뉴얼 수정 페이지
 * - 메뉴얼 ID를 URL 파라미터에서 가져옴
 * - useManualEditForm 훅으로 폼 상태 관리
 * - ManualEditForm 컴포넌트에 상태와 핸들러 전달
 */
const ManualEditPage: React.FC = () => {
  const { manualId } = useParams<{ manualId: string }>();

  if (!manualId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">메뉴얼 ID가 없습니다.</p>
        </div>
      </div>
    );
  }

  const {
    isLoading,
    isSaving,
    formData,
    guidelines,
    keywordInput,
    errors,
    setKeywordInput,
    handleInputChange,
    handleAddKeyword,
    handleRemoveKeyword,
    handleGuidelineChange,
    handleAddGuideline,
    handleRemoveGuideline,
    handleSave,
  } = useManualEditForm(manualId);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#005BAC] rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">메뉴얼을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">메뉴얼을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // DRAFT 상태가 아니면 편집 불가
  if (formData.status !== 'DRAFT') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {formData.status === 'APPROVED' ? '승인된' : '폐기된'} 메뉴얼은 수정할 수 없습니다.
          </p>
          <p className="text-sm text-gray-500">DRAFT 상태의 메뉴얼만 수정 가능합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <ManualEditForm
      formData={formData}
      guidelines={guidelines}
      keywordInput={keywordInput}
      errors={errors}
      isSaving={isSaving}
      onKeywordInputChange={setKeywordInput}
      onInputChange={handleInputChange}
      onAddKeyword={handleAddKeyword}
      onRemoveKeyword={handleRemoveKeyword}
      onGuidelineChange={handleGuidelineChange}
      onAddGuideline={handleAddGuideline}
      onRemoveGuideline={handleRemoveGuideline}
      onSubmit={handleSave}
    />
  );
};

export default ManualEditPage;

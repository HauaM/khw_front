/**
 * 공통코드 그룹 추가/수정 모달
 */
import React, { useEffect, useState } from 'react';
import { CommonCodeGroup, CommonCodeGroupPayload } from '@/lib/api/commonCodes';
import { useToast } from '@/hooks/useToast';

interface CommonCodeGroupModalProps {
  open: boolean;
  editingGroup: CommonCodeGroup | null;
  isSaving: boolean;

  onClose: () => void;
  onSave: (payload: CommonCodeGroupPayload) => Promise<void>;
  onDelete?: () => void;
}

const CommonCodeGroupModal: React.FC<CommonCodeGroupModalProps> = ({
  open,
  editingGroup,
  isSaving,
  onClose,
  onSave,
  onDelete,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    groupCode: '',
    groupName: '',
    description: '',
    isActive: true,
  });

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (editingGroup) {
      setFormData({
        groupCode: editingGroup.groupCode,
        groupName: editingGroup.groupName,
        description: editingGroup.description || '',
        isActive: editingGroup.isActive,
      });
    } else {
      setFormData({
        groupCode: '',
        groupName: '',
        description: '',
        isActive: true,
      });
    }
  }, [open, editingGroup]);

  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.groupCode.trim()) {
      showToast('그룹 코드는 필수입니다.', 'error');
      return;
    }
    if (!formData.groupName.trim()) {
      showToast('그룹명은 필수입니다.', 'error');
      return;
    }

    try {
      await onSave({
        groupCode: formData.groupCode.trim(),
        groupName: formData.groupName.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      });
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingGroup ? '그룹 수정' : '그룹 추가'}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* 그룹 코드 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              그룹 코드 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.groupCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  groupCode: e.target.value,
                }))
              }
              placeholder="예: BUSINESS_TYPE"
              disabled={editingGroup !== null}
              className="w-full h-9 border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-2">
              영문 대문자와 언더스코어(_)만 사용 가능합니다.
            </p>
          </div>

          {/* 그룹명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              그룹명 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  groupName: e.target.value,
                }))
              }
              placeholder="예: 업무구분"
              className="w-full h-9 border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="그룹에 대한 설명을 입력하세요."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 resize-none"
            />
          </div>

          {/* 활성 여부 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">활성 여부</label>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {editingGroup && onDelete && (
            <button
              onClick={onDelete}
              disabled={isSaving}
              className="mr-auto h-10 px-5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="h-10 px-5 bg-white text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonCodeGroupModal;

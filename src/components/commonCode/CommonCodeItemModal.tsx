/**
 * 공통코드 항목 추가/수정 모달
 */
import React, { useEffect, useState } from 'react';
import { CommonCodeItem, CommonCodeItemPayload } from '@/lib/api/commonCodes';
import { useToast } from '@/hooks/useToast';

interface CommonCodeItemModalProps {
  open: boolean;
  editingItem: CommonCodeItem | null;
  groupId: string | undefined;
  isSaving: boolean;

  onClose: () => void;
  onSave: (payload: CommonCodeItemPayload) => Promise<void>;
}

const CommonCodeItemModal: React.FC<CommonCodeItemModalProps> = ({
  open,
  editingItem,
  groupId,
  isSaving,
  onClose,
  onSave,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    codeKey: '',
    codeValue: '',
    sortOrder: 1,
    isActive: true,
    attributesJson: '',
  });

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (editingItem) {
      setFormData({
        codeKey: editingItem.codeKey,
        codeValue: editingItem.codeValue,
        sortOrder: editingItem.sortOrder,
        isActive: editingItem.isActive,
        attributesJson: editingItem.attributes
          ? JSON.stringify(editingItem.attributes, null, 2)
          : '',
      });
    } else {
      setFormData({
        codeKey: '',
        codeValue: '',
        sortOrder: 1,
        isActive: true,
        attributesJson: '',
      });
    }
  }, [open, editingItem]);

  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.codeKey.trim()) {
      showToast('코드 키는 필수입니다.', 'error');
      return;
    }
    if (!formData.codeValue.trim()) {
      showToast('코드 값은 필수입니다.', 'error');
      return;
    }

    if (!groupId) {
      showToast('그룹이 선택되지 않았습니다.', 'error');
      return;
    }

    // attributes JSON 파싱
    let attributes: Record<string, any> | undefined = undefined;
    if (formData.attributesJson.trim()) {
      try {
        attributes = JSON.parse(formData.attributesJson);
      } catch (error) {
        showToast('메타데이터 JSON 형식이 올바르지 않습니다.', 'error');
        return;
      }
    }

    try {
      await onSave({
        codeKey: formData.codeKey.trim(),
        codeValue: formData.codeValue.trim(),
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        attributes,
      });
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingItem ? '코드 항목 수정' : '코드 항목 추가'}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Row 1: Code Key & Code Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                코드 키 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.codeKey}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    codeKey: e.target.value,
                  }))
                }
                placeholder="예: DEPOSIT"
                className="w-full h-9 border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
              />
              <p className="text-xs text-gray-600 mt-2">영문 대문자와 언더스코어(_)만 사용</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                코드 값 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.codeValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    codeValue: e.target.value,
                  }))
                }
                placeholder="예: 예금"
                className="w-full h-9 border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Row 2: Sort Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                정렬 순서
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sortOrder: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="1"
                className="w-full h-9 border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">활성 여부</label>
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

          {/* 메타데이터 (속성) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              메타데이터 / 속성 (JSON)
            </label>
            <textarea
              value={formData.attributesJson}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  attributesJson: e.target.value,
                }))
              }
              placeholder={'{\n  "key": "value"\n}'}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 resize-none font-mono"
            />
            <p className="text-xs text-gray-600 mt-2">선택사항: JSON 형식으로 입력하세요.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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

export default CommonCodeItemModal;

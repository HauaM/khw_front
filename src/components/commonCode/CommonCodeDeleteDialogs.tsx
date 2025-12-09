/**
 * 공통코드 삭제 확인 다이얼로그
 * - 코드 항목 비활성화
 * - 그룹 삭제
 */
import React from 'react';
import { CommonCodeGroup, CommonCodeItem } from '@/lib/api/commonCodes';

/**
 * 코드 항목 비활성화 확인 다이얼로그
 */
interface DeleteItemDialogProps {
  open: boolean;
  targetItem: CommonCodeItem | null;
  isDeleting: boolean;

  onClose: () => void;
  onConfirm: (itemId: string) => Promise<void>;
}

export const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({
  open,
  targetItem,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!open || !targetItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">코드 비활성화</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            해당 코드 항목을 비활성화하시겠습니까?
            <br />
            비활성화된 항목은 시스템에서 사용되지 않습니다.
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 bg-white text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(targetItem.id)}
            disabled={isDeleting}
            className="h-9 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '처리 중...' : '비활성화'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 그룹 삭제 확인 다이얼로그
 */
interface DeleteGroupDialogProps {
  open: boolean;
  targetGroup: CommonCodeGroup | null;
  isDeleting: boolean;

  onClose: () => void;
  onConfirm: (groupId: string) => Promise<void>;
}

export const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  open,
  targetGroup,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!open || !targetGroup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">그룹 삭제</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            해당 그룹을 삭제하시겠습니까?
            <br />
            그룹에 속한 모든 코드 항목도 함께 삭제됩니다.
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 bg-white text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(targetGroup.id)}
            disabled={isDeleting}
            className="h-9 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '처리 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};

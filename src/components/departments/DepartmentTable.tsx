import React, { useState } from 'react';
import type { DepartmentResponse } from '@/types/users';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface DepartmentTableProps {
  departments: DepartmentResponse[];
  isLoading: boolean;
  onEdit: (department: DepartmentResponse) => void;
  onDelete: (id: string) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (dept: DepartmentResponse) => {
    setDeleteTarget({ id: dept.id, name: dept.department_name });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서명</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서코드</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">활성여부</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-primary-600">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                로딩 중...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서명</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서코드</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">활성여부</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-primary-600">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                조회된 데이터가 없습니다
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-primary-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서명</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">부서코드</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">활성여부</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-primary-600">관리</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr
              key={dept.id}
              className="hover:bg-gray-50"
            >
              <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                {dept.department_name}
              </td>
              <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                {dept.department_code}
              </td>
              <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${dept.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {dept.is_active ? '활성' : '비활성'}
                </span>
              </td>
              <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(dept)}
                    title="부서 수정"
                    className="w-8 h-8 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(dept)}
                    title="부서 삭제"
                    className="w-8 h-8 flex items-center justify-center rounded text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="부서 삭제"
        message={`"${deleteTarget?.name}" 부서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default DepartmentTable;

/**
 * 공통코드 항목 테이블 패널
 */
import React from 'react';
import { CommonCodeGroup, CommonCodeItem } from '@/lib/api/commonCodes';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CommonCodeItemTableProps {
  selectedGroup: CommonCodeGroup | null;
  codeItems: CommonCodeItem[];
  isLoading: boolean;

  onCreateItem: () => void;
  onEditItem: (itemId: string) => void;
  onDeactivateItem: (itemId: string) => void;
}

const CommonCodeItemTable: React.FC<CommonCodeItemTableProps> = ({
  selectedGroup,
  codeItems,
  isLoading,
  onCreateItem,
  onEditItem,
  onDeactivateItem,
}) => {
  if (!selectedGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div className="text-center">
          <div className="text-base text-gray-600 mb-1">그룹을 선택해주세요</div>
          <div className="text-sm text-gray-500">
            좌측에서 코드 그룹을 선택하면 상세 정보가 표시됩니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-50 border-b border-gray-200 px-5 py-4 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-1">
            {selectedGroup.groupName}
          </h2>
          <p className="text-sm text-gray-600">
            {selectedGroup.groupCode} - {selectedGroup.description}
          </p>
        </div>
        <button
          onClick={onCreateItem}
          className="h-9 px-4 bg-blue-600 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <PlusIcon className="w-4 h-4" />
          코드 항목 추가
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-600 border-b-2 border-gray-300 w-1/6">
                코드 키
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-600 border-b-2 border-gray-300 w-1/5">
                코드 값
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-600 border-b-2 border-gray-300 flex-1">
                설명
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 border-b-2 border-gray-300 w-20">
                정렬순서
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 border-b-2 border-gray-300 w-20">
                활성
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 border-b-2 border-gray-300 w-24">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : codeItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  등록된 코드 항목이 없습니다.
                </td>
              </tr>
            ) : (
              codeItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    !item.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">
                    {item.codeKey}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.codeValue}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.attributes ? JSON.stringify(item.attributes) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 font-mono">
                    {item.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => onEditItem(item.id)}
                        title="코드 수정"
                        className="w-8 h-8 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeactivateItem(item.id)}
                        title="코드 삭제"
                        className="w-8 h-8 flex items-center justify-center rounded text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommonCodeItemTable;

/**
 * 공통코드 그룹 목록 패널
 */
import React from 'react';
import { CommonCodeGroup } from '@/lib/api/commonCodes';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CommonCodeGroupListProps {
  filteredGroups: CommonCodeGroup[];
  selectedGroupId: string | null;
  searchTerm: string;
  isLoading: boolean;

  onSearchChange: (value: string) => void;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const CommonCodeGroupList: React.FC<CommonCodeGroupListProps> = ({
  filteredGroups,
  selectedGroupId,
  searchTerm,
  isLoading,
  onSearchChange,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
}) => {
  return (
    <div className="w-96 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">코드 그룹 목록</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="그룹코드 또는 그룹명 검색"
            className="w-full h-9 border border-gray-300 rounded px-3 pl-9 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-gray-500">그룹이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`p-3 rounded-md border cursor-pointer transition-all group relative flex flex-col ${
                  selectedGroupId === group.id
                    ? 'bg-blue-50 border-blue-600'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-blue-400'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-semibold text-blue-600">
                    {group.groupCode}
                  </span>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      group.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {group.isActive ? '활성' : '비활성'}
                  </span>
                </div>

                {/* Name */}
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {group.groupName}
                </div>

                {/* Description */}
                <div className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {group.description}
                </div>

                {/* Action buttons - 하단 배치 */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditGroup(group.id);
                    }}
                    title="그룹 수정"
                    className="w-7 h-7 flex items-center justify-center rounded text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGroup(group.id);
                    }}
                    title="그룹 삭제"
                    className="w-7 h-7 flex items-center justify-center rounded text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onCreateGroup}
          className="w-full h-10 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          그룹 추가
        </button>
      </div>
    </div>
  );
};

export default CommonCodeGroupList;

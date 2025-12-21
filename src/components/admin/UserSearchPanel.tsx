// User Search Panel Component
import React, { useEffect, useState } from 'react';
import TypeAheadSelectBox, {
  type TypeAheadOption,
} from '@/components/common/TypeAheadSelectBox';
import type { UserSearchFormParams, UserSortBy, SortOrder, UserRole } from '@/types/users';

interface UserSearchPanelProps {
  searchParams: UserSearchFormParams;
  onSearch: (params: UserSearchFormParams) => void;
  onReset: () => void;
  departmentOptions: TypeAheadOption[];
  isDepartmentLoading?: boolean;
}

const sortByOptions: Array<{ value: UserSortBy; label: string }> = [
  { value: 'created_at', label: '생성일' },
  { value: 'employee_id', label: '직번' },
  { value: 'name', label: '이름' },
];

const sortOrderOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'desc', label: '내림차순' },
  { value: 'asc', label: '오름차순' },
];

const roleOptions: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'CONSULTANT', label: '상담사' },
  { value: 'REVIEWER', label: '검토자' },
];

const activeOptions = [
  { value: '', label: '전체' },
  { value: 'true', label: '사용' },
  { value: 'false', label: '미사용' },
];

const UserSearchPanel: React.FC<UserSearchPanelProps> = ({
  searchParams,
  onSearch,
  onReset,
  departmentOptions,
  isDepartmentLoading = false,
}) => {
  const [localParams, setLocalParams] = useState<UserSearchFormParams>(searchParams);

  useEffect(() => {
    setLocalParams(searchParams);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localParams);
  };

  const handleLocalReset = () => {
    onReset();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">검색 조건</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-5 gap-4 mb-4">
          {/* 직번 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">직번</label>
            <input
              type="text"
              value={localParams.employee_id || ''}
              onChange={(e) =>
                setLocalParams({ ...localParams, employee_id: e.target.value })
              }
              placeholder="직번"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* 사용자 한글명 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">사용자 한글명</label>
            <input
              type="text"
              value={localParams.name || ''}
              onChange={(e) => setLocalParams({ ...localParams, name: e.target.value })}
              placeholder="이름"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* 역할 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">역할</label>
            <select
              value={localParams.role || ''}
              onChange={(e) =>
                setLocalParams({ ...localParams, role: e.target.value as UserRole | '' })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 사용 여부 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">사용 여부</label>
            <select
              value={localParams.is_active || ''}
              onChange={(e) =>
                setLocalParams({
                  ...localParams,
                  is_active: e.target.value as '' | 'true' | 'false',
                })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {activeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 부서 (TypeAhead) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">부서</label>
            <TypeAheadSelectBox
              options={departmentOptions}
              selectedCode={localParams.department_code || ''}
              onChange={(code) => {
                setLocalParams({ ...localParams, department_code: code || '' });
              }}
              placeholder="부서 선택"
              allowCreate={false}
              isLoading={isDepartmentLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">페이지</label>
            <input
              type="number"
              min={1}
              value={localParams.page ?? 1}
              onChange={(e) =>
                setLocalParams({ ...localParams, page: Number(e.target.value) || 1 })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">페이지 크기</label>
            <input
              type="number"
              min={1}
              max={100}
              value={localParams.page_size ?? 20}
              onChange={(e) =>
                setLocalParams({
                  ...localParams,
                  page_size: Number(e.target.value) || 20,
                })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">정렬 기준</label>
            <select
              value={localParams.sort_by || 'created_at'}
              onChange={(e) =>
                setLocalParams({ ...localParams, sort_by: e.target.value as UserSortBy })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {sortByOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">정렬 방향</label>
            <select
              value={localParams.sort_order || 'desc'}
              onChange={(e) =>
                setLocalParams({ ...localParams, sort_order: e.target.value as SortOrder })
              }
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {sortOrderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleLocalReset}
            className="px-4 py-2 text-sm font-semibold bg-white text-primary-500 border border-primary-500 rounded-md hover:bg-primary-50 transition"
          >
            초기화
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
          >
            조회
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSearchPanel;

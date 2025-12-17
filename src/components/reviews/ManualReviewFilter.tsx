/**
 * 메뉴얼 검토 Task 필터 컴포넌트
 * 상태, 업무구분, 시작일, 종료일 필터링을 제공합니다
 */

import React from 'react';
import { ManualReviewTaskFilters, ManualReviewStatus } from '@/types/reviews';
import { useToast } from '@/components/common/Toast';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import TypeAheadSelectBox from '@/components/common/TypeAheadSelectBox';

interface ManualReviewFilterProps {
  filters: ManualReviewTaskFilters;
  onChangeFilters: (filters: ManualReviewTaskFilters) => void;
  onReset: () => void;
}

const statusOptions: Array<'전체' | ManualReviewStatus> = [
  '전체',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'REJECTED',
];

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    TODO: '대기중',
    IN_PROGRESS: '검토중',
    DONE: '완료',
    REJECTED: '반려',
  };
  return labels[status] || status;
};

const ManualReviewFilter: React.FC<ManualReviewFilterProps> = ({
  filters,
  onChangeFilters,
  onReset,
}) => {
  const { showToast } = useToast();
  const { options: businessTypeOptions, isLoading: businessTypeLoading } = useCommonCodes('BUSINESS_TYPE');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({
      ...filters,
      status: e.target.value as '전체' | ManualReviewStatus,
    });
  };

  const handleBusinessTypeChange = (code: string) => {
    onChangeFilters({
      ...filters,
      businessType: (code || '전체') as any,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({
      ...filters,
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({
      ...filters,
      endDate: e.target.value,
    });
  };

  const handleReset = () => {
    onReset();
    showToast('필터가 초기화되었습니다.', 'info');
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-5 shadow-sm border border-gray-200">
      {/* 필터 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <svg
            className="h-[18px] w-[18px] text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          필터
        </h3>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-600 hover:bg-gray-50"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          초기화
        </button>
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 상태 필터 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="statusFilter" className="text-sm font-semibold text-gray-700">
            상태
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={handleStatusChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/20"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === '전체' ? '전체' : getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {/* 업무구분 필터 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="businessTypeFilter" className="text-sm font-semibold text-gray-700">
            업무구분
          </label>
          <TypeAheadSelectBox
            options={[
              { code: '', label: '전체' },
              ...businessTypeOptions,
            ]}
            selectedCode={filters.businessType === '전체' ? '' : filters.businessType}
            onChange={handleBusinessTypeChange}
            placeholder="업무구분 선택"
            allowCreate={false}
            isLoading={businessTypeLoading}
          />
        </div>

        {/* 시작일 필터 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
            시작일
          </label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/20"
          />
        </div>

        {/* 종료일 필터 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
            종료일
          </label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/20"
          />
        </div>
      </div>
    </div>
  );
};

export default ManualReviewFilter;

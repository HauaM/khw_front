/**
 * 메뉴얼 검토 Task 테이블 컴포넌트
 * Task 목록을 테이블 형식으로 표시합니다
 */

import React from 'react';
import { ManualReviewTask, ManualReviewStatus } from '@/types/reviews';

interface ManualReviewTableProps {
  tasks: ManualReviewTask[];
  totalCount: number;
  onRowClick: (task: ManualReviewTask) => void;
}

const getStatusLabel = (status: ManualReviewStatus): string => {
  const labels: Record<ManualReviewStatus, string> = {
    TODO: '대기중',
    IN_PROGRESS: '검토중',
    DONE: '완료',
    REJECTED: '반려',
  };
  return labels[status];
};

const getStatusBadgeClasses = (status: ManualReviewStatus): string => {
  const classes: Record<ManualReviewStatus, string> = {
    TODO: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-50 text-blue-600',
    DONE: 'bg-green-50 text-green-600',
    REJECTED: 'bg-red-50 text-red-600',
  };
  return classes[status];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const ManualReviewTable: React.FC<ManualReviewTableProps> = ({
  tasks,
  totalCount,
  onRowClick,
}) => {
  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">검토 Task 목록</h3>
        <span className="text-sm font-semibold text-gray-600">총 {totalCount}건</span>
      </div>

      {/* 테이블 컨테이너 */}
      <div className="overflow-x-auto">
        {tasks.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-blue-600">
                  주제
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-blue-600">
                  업무구분
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-blue-600">
                  에러코드
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-blue-600">
                  상태
                </th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-blue-600">
                  생성일시
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.task_id}
                  onClick={() => onRowClick(task)}
                  className="border-b border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{task.new_manual_topic || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{task.business_type_name || '-'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{task.new_error_code || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${getStatusBadgeClasses(
                        task.status
                      )}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="mb-4 h-16 w-16 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h4 className="mb-2 text-base font-semibold text-gray-700">검색 결과가 없습니다</h4>
            <p className="text-sm text-gray-600">필터 조건을 변경해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualReviewTable;

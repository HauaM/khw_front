/**
 * 메뉴얼 검토 Task 통계 카드 컴포넌트
 * 대기중/검토중/완료/반려 상태별 Task 개수를 표시합니다
 */

import React from 'react';

interface ManualReviewStatsProps {
  todo: number;
  inProgress: number;
  done: number;
  rejected: number;
}

const ManualReviewStats: React.FC<ManualReviewStatsProps> = ({
  todo,
  inProgress,
  done,
  rejected,
}) => {
  const stats = [
    { label: '대기중', value: todo, color: 'border-l-gray-500' },
    { label: '검토중', value: inProgress, color: 'border-l-blue-600' },
    { label: '완료', value: done, color: 'border-l-green-600' },
    { label: '반려', value: rejected, color: 'border-l-red-600' },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border-l-4 bg-white p-5 shadow-sm ${stat.color}`}
        >
          <p className="mb-2 text-sm font-semibold text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ManualReviewStats;

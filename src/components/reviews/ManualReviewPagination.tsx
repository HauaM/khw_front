/**
 * 메뉴얼 검토 Task 목록 페이지네이션 컴포넌트
 * HTML 08_메뉴얼검토TASK목록화면.html의 구조를 따름
 */

import React from 'react';

interface ManualReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ManualReviewPagination: React.FC<ManualReviewPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // 페이지 번호 배열 생성: 현재 페이지 ±1, 첫 페이지, 마지막 페이지는 항상 포함
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    // 첫 페이지 추가
    pages.push(1);

    // 첫 페이지와 현재 페이지 사이에 간격이 있으면 ... 추가
    if (currentPage > 2) {
      pages.push('...');
    }

    // 현재 페이지 주변 페이지 추가 (현재 -1 ~ 현재 +1)
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // 현재 페이지와 마지막 페이지 사이에 간격이 있으면 ... 추가
    if (currentPage < totalPages - 1) {
      pages.push('...');
    }

    // 마지막 페이지 추가
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 border-t border-gray-200 py-5">
      {/* 이전 버튼 */}
      <button
        className="flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <svg
          style={{ width: '16px', height: '16px' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-600">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md border text-sm font-semibold transition-all ${
              isActive
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        );
      })}

      {/* 다음 버튼 */}
      <button
        className="flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <svg
          style={{ width: '16px', height: '16px' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default ManualReviewPagination;

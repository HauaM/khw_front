/**
 * 메뉴얼 검토 Task 목록 페이지
 * 검토 대기 중인 메뉴얼의 Task를 조회하고 관리합니다
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualReviewTask, ManualReviewTaskFilters } from '@/types/reviews';
import { useManualReviewTasks } from '@/hooks/useManualReviewTasks';
import ManualReviewStats from '@/components/reviews/ManualReviewStats';
import ManualReviewFilter from '@/components/reviews/ManualReviewFilter';
import ManualReviewTable from '@/components/reviews/ManualReviewTable';
import ManualReviewPagination from '@/components/reviews/ManualReviewPagination';

const ITEMS_PER_PAGE = 10;

const ReviewTaskListPage: React.FC = () => {
  const navigate = useNavigate();

  // 필터 상태
  const [filters, setFilters] = useState<ManualReviewTaskFilters>({
    status: '전체',
    businessType: '전체',
    startDate: '',
    endDate: '',
  });

  // 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터 조회
  const { data: tasks } = useManualReviewTasks({ filters });

  // 필터링된 Task 계산
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // 상태 필터
    if (filters.status !== '전체') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // 업무구분 필터
    if (filters.businessType !== '전체') {
      filtered = filtered.filter((task) => task.business_type === filters.businessType);
    }

    // 시작일 필터
    if (filters.startDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.created_at);
        const startDate = new Date(filters.startDate);
        return taskDate >= startDate;
      });
    }

    // 종료일 필터
    if (filters.endDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.created_at);
        const endDate = new Date(filters.endDate);
        // 종료일 끝까지 포함하도록 23:59:59로 설정
        endDate.setHours(23, 59, 59, 999);
        return taskDate <= endDate;
      });
    }

    return filtered;
  }, [tasks, filters]);

  // 통계 데이터 계산
  const stats = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
      rejected: tasks.filter((t) => t.status === 'REJECTED').length,
    };
  }, [tasks]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  // 필터 변경 핸들러
  const handleFilterChange = (nextFilters: ManualReviewTaskFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setFilters({
      status: '전체',
      businessType: '전체',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  // Task row 클릭 핸들러
  const handleRowClick = (task: ManualReviewTask) => {
    navigate(`/reviews/tasks/${task.task_id}`);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="space-y-6">
      {/* 페이지 헤더 */}
      <section>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">메뉴얼 검토</h1>
        <p className="text-sm text-gray-600">
          승인·반려를 기다리는 메뉴얼 검토 Task를 조회합니다
        </p>
      </section>

      {/* 통계 카드 */}
      <ManualReviewStats
        todo={stats.todo}
        inProgress={stats.inProgress}
        done={stats.done}
        rejected={stats.rejected}
      />

      {/* 필터 */}
      <ManualReviewFilter
        filters={filters}
        onChangeFilters={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* 테이블 */}
      <ManualReviewTable
        tasks={paginatedTasks}
        totalCount={filteredTasks.length}
        onRowClick={handleRowClick}
      />

      {/* 페이지네이션 */}
      {paginatedTasks.length > 0 && totalPages > 1 && (
        <ManualReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
};

export default ReviewTaskListPage;

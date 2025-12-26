import React from 'react';
import { useParams } from 'react-router-dom';
import { useManualReviewComparison } from '@/hooks/useManualReviewComparison';
import ManualReviewDetailView from '@/components/reviews/ManualReviewDetailView';

/**
 * 메뉴얼 검토 상세 페이지
 *
 * API 공통 규격을 적용한 새로운 구조:
 * - useApiQuery 패턴으로 자동 에러/피드백 처리
 * - 단일 API 호출로 모든 데이터 조회 (기존 3회 → 1회)
 * - feedback을 통한 AI 분석 결과 표시
 */
const ManualReviewDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();

  // useApiQuery 패턴: 자동 에러/피드백 처리
  const { data, isLoading, error } = useManualReviewComparison(taskId || '');

  if (!taskId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-center text-sm text-gray-600">
          유효하지 않은 Task ID입니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-center text-sm text-gray-600">
            검토 상세 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="mb-2 text-center text-sm text-gray-600">
            검토 상세 정보를 불러올 수 없습니다.
          </p>
          <p className="text-xs text-gray-500">
            에러가 자동으로 표시되었습니다. 목록으로 돌아가 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ManualReviewDetailView detail={data} />
    </div>
  );
};

export default ManualReviewDetailPage;

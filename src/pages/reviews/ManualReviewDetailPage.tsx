import React from 'react';
import { useParams } from 'react-router-dom';
import { useManualReviewDetail } from '@/hooks/useManualReviewDetail';
import ManualReviewDetailView from '@/components/reviews/ManualReviewDetailView';

const ManualReviewDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { data, isLoading, isError, error } = useManualReviewDetail(
    taskId || ''
  );

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
        <p className="text-center text-sm text-gray-600">
          데이터를 불러오는 중...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="mb-2 text-center text-sm text-gray-600">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          {error && (
            <p className="text-xs text-gray-500">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return <ManualReviewDetailView detail={data} />;
};

export default ManualReviewDetailPage;

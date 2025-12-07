import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useManualDetail } from '@/hooks/useManualDetail';
import { useToast } from '@/contexts/ToastContext';
import ManualDetailView from '@/components/manuals/ManualDetailView';

/**
 * 메뉴얼 상세 조회 페이지
 * Route: /manuals/:manualId
 */
const ManualDetailPage: React.FC = () => {
  const { manualId } = useParams<{ manualId: string }>();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useManualDetail(manualId || '');

  // 에러 발생 시 Toast 알림 표시 (Hook은 최상위 레벨에서 호출)
  useEffect(() => {
    if (isError && error) {
      showToast('메뉴얼을 불러오는데 실패했습니다.', 'error');
    }
  }, [isError, error, showToast]);

  // 데이터 로딩 중
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700">메뉴얼을 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 발생 또는 데이터 없음
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-700">메뉴얼을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 정상: 데이터 표시
  return <ManualDetailView detail={data} />;
};

export default ManualDetailPage;

import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useManualVersionCompare } from '@/hooks/useManualVersionCompare';
import ManualVersionCompareView from '@/components/manuals/ManualVersionCompareView';

/**
 * 메뉴얼 버전 비교 페이지
 *
 * 경로: /manuals/:manualId/versions/compare
 * 쿼리: ?old=v2.0&new=v2.1
 *
 * 두 버전의 메뉴얼 내용을 좌우로 비교하여 보여줍니다
 */
const ManualVersionComparePage: React.FC = () => {
  const { manualId } = useParams<{ manualId: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // URL 쿼리에서 버전 파라미터 추출
  const initialOld = useMemo(() => searchParams.get('old') || undefined, [searchParams]);
  const initialNew = useMemo(() => searchParams.get('new') || undefined, [searchParams]);

  // 버전 비교 훅
  const {
    versions,
    oldVersion,
    newVersion,
    oldData,
    newData,
    isLoading,
    isError,
    error,
    setOldVersion,
    setNewVersion,
    getKeywordStatus,
    getGuidelineStatus,
  } = useManualVersionCompare(manualId || '', initialOld, initialNew);

  // 에러 발생 시 Toast 표시
  React.useEffect(() => {
    if (isError && error) {
      showToast('버전 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  }, [isError, error, showToast]);

  // manualId 없음
  if (!manualId) {
    return (
      <main className="flex-1 overflow-y-auto p-6 w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">메뉴얼을 찾을 수 없습니다</h2>
          <p className="text-sm text-gray-600">올바른 메뉴얼 ID를 확인해주세요</p>
        </div>
      </main>
    );
  }

  // 사용 가능한 버전이 없음
  if (!isLoading && versions.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-6 w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">사용 가능한 버전이 없습니다</h2>
          <p className="text-sm text-gray-600">
            이 메뉴얼의 버전 정보를 불러올 수 없습니다
          </p>
        </div>
      </main>
    );
  }

  return (
    <ManualVersionCompareView
      manualId={manualId}
      versions={versions}
      oldVersion={oldVersion}
      newVersion={newVersion}
      oldData={oldData}
      newData={newData}
      isLoading={isLoading}
      setOldVersion={setOldVersion}
      setNewVersion={setNewVersion}
      getKeywordStatus={getKeywordStatus}
      getGuidelineStatus={getGuidelineStatus}
    />
  );
};

export default ManualVersionComparePage;

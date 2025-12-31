import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ManualDraft } from '@/types/manuals';
import { useManualDraftComparison } from '@/hooks/useManualDraftComparison';
import { convertApiResponseToManualDraft } from '@/lib/api/manuals';
import ManualDraftResultView from '@/components/manuals/ManualDraftResultView';
import Spinner from '@/components/common/Spinner';
import { useToast } from '@/contexts/ToastContext';

/**
 * location.state 타입 정의
 */
interface ManualDraftLocationState {
  draft?: ManualDraft;
  comparisonType?: 'new' | 'similar' | 'supplement';
  existingManual?: ManualDraft | null;
  similarityScore?: number | null;
}

/**
 * 메뉴얼 초안 결과 페이지
 *
 * 2가지 사용 시나리오:
 * 1. 초안 생성 직후 (권장):
 *    - `location.state`로 초안 데이터 및 비교 정보 전달
 *    - 네트워크 요청 없이 즉시 표시
 *    - 예: navigate('/manuals/draft/DRAFT-001', {
 *        state: { draft, comparisonType, existingManual, similarityScore }
 *      })
 *
 * 2. 저장된 초안 재조회 (목록→상세, URL 직접 접근):
 *    - GET /api/v1/manuals/draft/{manual_id}로 비교 정보 포함 조회
 *    - comparison_type, draft_entry, existing_manual, similarity_score 모두 포함
 */
const ManualDraftResultPage: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const draftId = params.id ?? '';
  const locationState = (location.state as ManualDraftLocationState | null) ?? {};
  const { showToast } = useToast();
  const toastShownRef = React.useRef(false);

  // location.state에 데이터가 있는지 확인
  const hasStateData = !!locationState.draft && !!locationState.comparisonType;

  // location.state가 없을 때만 API 호출
  const { data: comparisonData, isLoading, error } = useManualDraftComparison(
    draftId,
    !hasStateData // location.state가 없을 때만 enabled
  );

  // Draft 데이터 결정 (state 우선, 없으면 API 응답)
  const draft = hasStateData
    ? locationState.draft!
    : comparisonData
    ? convertApiResponseToManualDraft(comparisonData.draft_entry)
    : null;

  // 비교 정보 결정
  const comparisonType = hasStateData
    ? locationState.comparisonType!
    : comparisonData?.comparison_type;

  const existingManual = hasStateData
    ? locationState.existingManual
    : comparisonData?.existing_manual
    ? convertApiResponseToManualDraft(comparisonData.existing_manual)
    : null;

  const similarityScore = hasStateData
    ? locationState.similarityScore
    : comparisonData?.similarity_score;

  // Draft 상태 관리 (저장 후 업데이트용)
  const [currentDraft, setCurrentDraft] = useState<ManualDraft | null>(draft);

  // draft가 변경되면 currentDraft 업데이트
  React.useEffect(() => {
    if (draft) {
      setCurrentDraft(draft);
    }
  }, [draft]);

  // ID 검증
  React.useEffect(() => {
    if (!draftId && !toastShownRef.current) {
      showToast('메뉴얼 ID가 누락되었습니다. URL을 확인해주세요.', 'error');
      toastShownRef.current = true;
    }
  }, [draftId, showToast]);

  // 저장 후 초안 데이터 업데이트
  const handleSaved = (updatedDraft: ManualDraft) => {
    setCurrentDraft(updatedDraft);
  };

  // 로딩 중 (API 호출 중일 때만)
  if (!hasStateData && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" className="mb-4 text-primary-500" />
        <p className="text-gray-600">초안 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 발생
  if (!hasStateData && error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-12 w-12 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">초안을 불러올 수 없습니다</h3>
        <p className="text-gray-600">초안 데이터를 불러올 수 없습니다. 초안 생성 페이지로 돌아가세요.</p>
      </div>
    );
  }

  // 데이터가 없으면 표시 불가
  if (!currentDraft) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">초안 데이터 없음</h3>
        <p className="text-gray-600">초안을 생성한 후 다시 접속해주세요.</p>
      </div>
    );
  }

  return (
    <ManualDraftResultView
      draft={currentDraft}
      comparisonType={comparisonType}
      existingManual={existingManual}
      similarityScore={similarityScore}
      onSaved={handleSaved}
    />
  );
};

export default ManualDraftResultPage;

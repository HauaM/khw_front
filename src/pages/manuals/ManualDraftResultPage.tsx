import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ManualDraft } from '@/types/manuals';
import { useManualDraft } from '@/hooks/useManualDraft';
import ManualDraftResultView from '@/components/manuals/ManualDraftResultView';
import Spinner from '@/components/common/Spinner';

/**
 * 메뉴얼 초안 결과 페이지
 *
 * 2가지 사용 시나리오:
 * 1. 초안 생성 직후 (권장):
 *    - `location.state.draft`로 초안 데이터 전달
 *    - 예: navigate('/manuals/draft/DRAFT-001', { state: { draft: createdDraft } })
 *
 * 2. 저장된 초안 재조회 (데모/테스트용):
 *    - URL 파라미터 `:id`로 접근 시 mock 데이터 로드
 *    - 추후 백엔드 GET API 구현 후 실제 조회 가능
 */
const ManualDraftResultPage: React.FC = () => {
  const location = useLocation();
  const draftFromState = (location.state as { draft?: ManualDraft } | null)?.draft;

  // 라우트 상태에서 전달받은 draft가 있으면 사용, 없으면 mock 로드
  const { data: mockDraft, isLoading, isError, error } = useManualDraft('');
  const [currentDraft, setCurrentDraft] = useState<ManualDraft | null>(draftFromState || mockDraft || null);

  // mockDraft가 업데이트되면 currentDraft도 업데이트 (draftFromState가 없을 때만)
  React.useEffect(() => {
    if (!draftFromState && mockDraft) {
      setCurrentDraft(mockDraft);
    }
  }, [mockDraft, draftFromState]);

  // 저장 후 초안 데이터 업데이트
  const handleSaved = (updatedDraft: ManualDraft) => {
    setCurrentDraft(updatedDraft);
  };

  // 로딩 중 (라우트 상태에서 데이터를 받지 못한 경우)
  if (!draftFromState && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" className="mb-4 text-[#005BAC]" />
        <p className="text-gray-600">초안 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 발생
  if (!draftFromState && (isError || !currentDraft)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-12 w-12 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">초안을 불러올 수 없습니다</h3>
        <p className="text-gray-600">
          {error?.message || '초안 데이터를 불러올 수 없습니다. 초안 생성 페이지로 돌아가세요.'}
        </p>
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

  return <ManualDraftResultView draft={currentDraft} onSaved={handleSaved} />;
};

export default ManualDraftResultPage;

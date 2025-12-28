import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ApprovedManualHeader from '@/components/manuals/ApprovedManualHeader';
import ApprovedManualCardList from '@/components/manuals/ApprovedManualCardList';
import { useApprovedManualCards } from '@/hooks/useApprovedManualCards';
import { useToast } from '@/hooks/useToast';
import ConsultationDetailModal from '@/components/modals/ConsultationDetailModal';
import type { ManualCardItem } from '@/types/manuals';

type ManualListItem = ManualCardItem;

const HIGHLIGHT_DURATION = 3000;
const SUGGESTION_LIMIT = 5;
const FALLBACK_MANUAL_ID = '3c4a6bbf-6d3a-4f6c-92cb-7e1e7ab2f0f9';

const ApprovedManualCardsPage: React.FC = () => {
  const { manualId: routeManualId } = useParams<{ manualId?: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didAutoScrollRef = useRef(false);
  const [highlightedManualId, setHighlightedManualId] = useState<string | null>(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const queryManualId = searchParams.get('manual_id');
  const trimmedQueryManualId = queryManualId?.trim() || null;
  const trimmedRouteManualId = routeManualId?.trim() || null;
  const manualIdTarget = trimmedQueryManualId || trimmedRouteManualId || null;
  const manualIdForRequest = manualIdTarget || FALLBACK_MANUAL_ID;

  const { data: manuals, isLoading, error } = useApprovedManualCards(manualIdForRequest);
  const [filterTerm, setFilterTerm] = useState('');

  // 안전하게 첫 번째 데이터에서 업무구분과 에러코드 추출
  const displayInfo = useMemo(() => {
    if (isLoading) {
      return {
        businessType: '조회 중...',
        errorCode: '조회 중...'
      };
    }
    if (manuals.length === 0) {
      return {
        businessType: '정보 없음',
        errorCode: '정보 없음'
      };
    }
    return {
      businessType: manuals[0].business_type || '정보 없음',
      errorCode: manuals[0].error_code || '정보 없음'
    };
  }, [manuals, isLoading]);
  const filteredManuals = useMemo(() => {
    if (!filterTerm) return manuals;
    const normalized = filterTerm.toLowerCase();
    return manuals.filter((manual: ManualListItem) => {
      const topicMatches = manual.topic.toLowerCase().includes(normalized);
      const keywordMatches = manual.keywords.some((keyword: string) =>
        keyword.toLowerCase().includes(normalized)
      );
      const idMatches = manual.id === filterTerm;
      return topicMatches || keywordMatches || idMatches;
    });
  }, [manuals, filterTerm]);
  const listToRender = filterTerm ? filteredManuals : manuals;



  const scrollToManual = useCallback(
    (manualId?: string | null) => {
      const targetId = manualId?.trim();
      if (!targetId) {
        showToast('Manual ID를 입력해주세요.', 'warning');
        return;
      }

      const targetElement = cardRefs.current[targetId];
      if (!targetElement) {
        const suggestions = manuals.slice(0, SUGGESTION_LIMIT).map((manual: ManualListItem) => manual.id);
        const suggestionMessage = suggestions.length
          ? `\n사용 가능한 ID:\n- ${suggestions.join('\n- ')}`
          : '';
        showToast(`해당 Manual ID를 찾을 수 없습니다.${suggestionMessage}`, 'error');
        return;
      }

      setHighlightedManualId(targetId);

      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }

      requestAnimationFrame(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedManualId(null);
      }, HIGHLIGHT_DURATION);
    },
    [manuals, showToast]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();

      if (!trimmed) {
        showToast('검색어를 입력해주세요.', 'warning');
        return;
      }

      setFilterTerm(trimmed);

      const normalized = trimmed.toLowerCase();
      const matchedManuals = manuals.filter((manual: ManualListItem) => {
        const topicMatches = manual.topic.toLowerCase().includes(normalized);
        const keywordMatches = manual.keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(normalized)
        );
        const idMatches = manual.id === trimmed;
        return topicMatches || keywordMatches || idMatches;
      });

      if (!matchedManuals.length) {
        showToast('조건에 맞는 Manual을 찾을 수 없습니다.', 'info');
        return;
      }

      const firstMatch = matchedManuals[0];
      setHighlightedManualId(firstMatch.id);
      scrollToManual(firstMatch.id);
    },
    [manuals, scrollToManual, showToast]
  );

  const handleClearFilter = () => {
    setFilterTerm('');
    setHighlightedManualId(null);
  };

  const handleOpenConsultation = useCallback((consultationId: string) => {
    setSelectedConsultationId(consultationId);
  }, []);

  const handleCloseConsultation = useCallback(() => {
    setSelectedConsultationId(null);
  }, []);

  useEffect(() => {
    if (manualIdTarget && manuals.length > 0 && !didAutoScrollRef.current) {
      scrollToManual(manualIdTarget);
      didAutoScrollRef.current = true;
    }
  }, [manualIdTarget, manuals.length, scrollToManual]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-900">메뉴얼 상세 조회</h1>
        <p className="text-sm text-gray-600">
          업무구분: <span className="font-semibold text-gray-900">{displayInfo.businessType}</span> / 에러코드:{' '}
          <span className="font-semibold text-gray-900">{displayInfo.errorCode}</span>
        </p>
      </header>
      <ApprovedManualHeader onSearch={handleSearch} onClear={handleClearFilter} />

      {isLoading && manuals.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
          승인된 메뉴얼을 불러오는 중입니다...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-error bg-error-light p-6 text-sm text-red-700">
          승인된 메뉴얼을 불러오는 중 오류가 발생했습니다. {error.message}
        </div>
      )}

      {!isLoading && !error && manuals.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
          승인된 메뉴얼이 없습니다.
        </div>
      )}

      {filterTerm && !isLoading && !error && listToRender.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center text-sm text-yellow-600 shadow-sm">
          검색 조건에 맞는 메뉴얼이 없습니다.
        </div>
      )}

          {listToRender.length > 0 && (
            <ApprovedManualCardList
              manuals={listToRender}
              highlightedManualId={highlightedManualId}
              onViewConsultation={handleOpenConsultation}
          cardRefs={cardRefs}
        />
      )}

      <ConsultationDetailModal
        consultationId={selectedConsultationId ?? ''}
        isOpen={Boolean(selectedConsultationId)}
        onClose={handleCloseConsultation}
        isNew={false}
      />
    </div>
  );
};

export default ApprovedManualCardsPage;

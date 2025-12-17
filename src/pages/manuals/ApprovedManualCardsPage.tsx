import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ApprovedManualHeader from '@/components/manuals/ApprovedManualHeader';
import ApprovedManualCardList from '@/components/manuals/ApprovedManualCardList';
import { useApprovedManualCards } from '@/hooks/useApprovedManualCards';
import { useToast } from '@/hooks/useToast';
import ConsultationDetailModal from '@/components/modals/ConsultationDetailModal';

const DEFAULT_BUSINESS_TYPE = 'INTERNET_BANKING';
const DEFAULT_ERROR_CODE = 'E001';
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



  const scrollToManual = useCallback(
    (manualId?: string | null) => {
      const targetId = manualId?.trim();
      if (!targetId) {
        showToast('Manual ID를 입력해주세요.', 'warning');
        return;
      }

      const targetElement = cardRefs.current[targetId];
      if (!targetElement) {
        const suggestions = manuals.slice(0, SUGGESTION_LIMIT).map((manual) => manual.id);
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

      const manualById = manuals.find((manual) => manual.id === trimmed);
      if (manualById) {
        scrollToManual(manualById.id);
        return;
      }

      const normalized = trimmed.toLowerCase();
      const matchedManual = manuals.find((manual) => {
        const topicMatches = manual.topic.toLowerCase().includes(normalized);
        const keywordMatches = manual.keywords.some((keyword) =>
          keyword.toLowerCase().includes(normalized)
        );
        return topicMatches || keywordMatches;
      });

      if (!matchedManual) {
        showToast('조건에 맞는 Manual을 찾을 수 없습니다.', 'info');
        return;
      }

      scrollToManual(matchedManual.id);
    },
    [manuals, scrollToManual, showToast]
  );

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
          업무구분: <span className="font-semibold text-gray-900">{DEFAULT_BUSINESS_TYPE}</span> / 에러코드:{' '}
          <span className="font-semibold text-gray-900">{DEFAULT_ERROR_CODE}</span>
        </p>
      </header>
      <div className="sticky top-6 z-10 bg-transparent">
        <ApprovedManualHeader onSearch={handleSearch} />
      </div>

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

      {manuals.length > 0 && (
        <ApprovedManualCardList
          manuals={manuals}
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

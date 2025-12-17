import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ApprovedManualHeader from '@/components/manuals/ApprovedManualHeader';
import ApprovedManualCardList from '@/components/manuals/ApprovedManualCardList';
import ConsultationModal from '@/components/consultations/ConsultationModal';
import { useApprovedManualCards } from '@/hooks/useApprovedManualCards';
import { useConsultationDetailForManual } from '@/hooks/useConsultationDetailForManual';
import { useToast } from '@/hooks/useToast';

const DEFAULT_BUSINESS_TYPE = 'INTERNET_BANKING';
const DEFAULT_ERROR_CODE = 'E001';
const HIGHLIGHT_DURATION = 3000;
const SUGGESTION_LIMIT = 5;

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
  const manualIdTarget = useMemo(() => {
    const trimmed = queryManualId?.trim();
    if (trimmed) {
      return trimmed;
    }
    return routeManualId || null;
  }, [queryManualId, routeManualId]);

  const { data: manuals, isLoading, error } = useApprovedManualCards(
    DEFAULT_BUSINESS_TYPE,
    DEFAULT_ERROR_CODE
  );

  const { data: consultationDetail, isLoading: isConsultationLoading, error: consultationError } =
    useConsultationDetailForManual(selectedConsultationId, Boolean(selectedConsultationId));

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
    <div className="flex h-full w-full flex-col gap-6 overflow-auto px-6 py-6">
      <ApprovedManualHeader
        businessType={DEFAULT_BUSINESS_TYPE}
        errorCode={DEFAULT_ERROR_CODE}
        onSearchManualId={scrollToManual}
      />

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

      <ConsultationModal
        isOpen={Boolean(selectedConsultationId)}
        consultation={consultationDetail}
        isLoading={isConsultationLoading}
        error={consultationError}
        onClose={handleCloseConsultation}
      />
    </div>
  );
};

export default ApprovedManualCardsPage;

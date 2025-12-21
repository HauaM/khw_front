import React, { useState, useEffect } from 'react';
import { BusinessType } from '@/lib/api/consultations';
import { useSimilarConsultations } from '@/hooks/useSimilarConsultations';
import Spinner from '../common/Spinner';
import SimilarResultDetail from './SimilarResultDetail';
import SimilarResultList from './SimilarResultList';
import ConsultationDetailModal from '../modals/ConsultationDetailModal';



interface SimilarComparePanelProps {
  inquiryText: string;
  actionTaken: string;
  businessType: BusinessType | '';
  errorCode: string;
}

/**
 * 유사 데이터 조회/비교 패널 (v3 핵심)
 *
 * - 오른쪽 4영역에 표시
 * - inquiry_text 기반 자동 조회 (디바운스 적용)
 * - Top-3 결과 표시
 * - Top-1은 상세 + 비교, Top-2/3은 리스트
 */
const SimilarComparePanel: React.FC<SimilarComparePanelProps> = ({
  inquiryText,
  actionTaken,
  businessType,
  errorCode,
}) => {
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(true);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConsultationId, setModalConsultationId] = useState<string>('');

  const { results, status, error, refetch, isLoading } = useSimilarConsultations({
    inquiry_text: inquiryText,
    action_taken: actionTaken,
    business_type: businessType,
    error_code: errorCode,
    enabled: autoSearchEnabled,
    debounceMs: 1000,
    minLength: 4,
  });

  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            조회 중...
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            Top-{results.length} 발견
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            조회 실패
          </span>
        );
      case 'insufficient':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
            입력 부족
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            대기 중
          </span>
        );
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      setSelectedRank(results[0].rank);
    }
  }, [results]);

  const selectedResult = results.find((r) => r.rank === selectedRank) || results[0];

  const otherResults = results.filter((r) => r.rank !== selectedRank);

  return (
    <>
      <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-base font-semibold text-gray-900">관련 메뉴얼 조회</h3>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={refetch}
            disabled={isLoading}
            className="rounded-md border border-primary-500 px-3 py-1 text-xs font-semibold text-primary-500 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            수동 조회
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
        {/* 자동 조회 토글 */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={autoSearchEnabled}
            onChange={(e) => setAutoSearchEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <label>자동 조회 활성화 (문의내용 4자 이상 입력 시)</label>
        </div>

        {/* 상태별 표시 */}
        {status === 'insufficient' && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm">
            <p className="font-semibold text-yellow-800">조회 조건 부족</p>
            <p className="mt-1 text-xs text-yellow-700">
              문의내용을 4자 이상 입력해주세요.
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="text-primary-500" />
            <p className="mt-4 text-sm text-gray-600">관련 메뉴얼을 조회하는 중...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm">
            <p className="font-semibold text-red-800">조회 실패</p>
            <p className="mt-1 text-xs text-red-700">
              {error || '잠시 후 다시 시도해주세요.'}
            </p>
          </div>
        )}

        {status === 'success' && results.length === 0 && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">유사한 상담이 없습니다.</p>
            <p className="mt-1 text-xs text-gray-500">신규 등록 가능성이 높습니다.</p>
          </div>
        )}

        {status === 'success' && results.length > 0 && selectedResult && (
          <>
            {/* Top-1 상세 */}
            <SimilarResultDetail
              result={selectedResult}
              onViewOriginal={(consultationId) => {
                setModalConsultationId(consultationId);
                setIsModalOpen(true);
              }}
            />

            {/* Top-2/3 리스트 */}
            {otherResults.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <SimilarResultList
                  results={otherResults}
                  onSelect={(result) => setSelectedRank(result.rank)}
                  selectedRank={selectedRank}
                />
              </div>
            )}
          </>
        )}
      </div>
      </div>

      {isModalOpen && modalConsultationId && (
        <ConsultationDetailModal
          consultationId={modalConsultationId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isNew={false}
        />
      )}
    </>
  );
};

export default SimilarComparePanel;

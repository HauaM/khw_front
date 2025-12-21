import React from 'react';
import { SimilarConsultationResult } from '@/lib/api/consultations';

interface SimilarResultDetailProps {
  result: SimilarConsultationResult;
  onViewOriginal?: (consultationId: string) => void;
}

/**
 * 관련 메뉴얼 Top-1 상세 뷰
 *
 * - 유사도 점수, 업무구분, 에러코드 등 메타 정보 표시
 * - 문의내용/조치내용을 현재 입력 중인 데이터와 비교
 */
const SimilarResultDetail: React.FC<SimilarResultDetailProps> = ({
  result,
  onViewOriginal,
}) => {
  const getSimilarityBadgeVariant = (score: number) => {
    if (score >= 85) return 'bg-red-100 text-red-700 border border-red-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    return 'bg-green-100 text-green-700 border border-green-300';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 85) return '유사도 매우 높음';
    if (score >= 70) return '유사도 높음';
    return '유사도 보통';
  };

  const manualId = result.manual_id || result.consultation_id;
  const originalConsultationId =
    result.original_consultation_id || result.metadata_fields?.source_consultation_id;
  const subject = result.subject || result.metadata_fields?.manual_topic || result.inquiry_text;
  const keywords = result.keywords || [];
  const background = result.inquiry_text || '-';
  const actionTaken = result.action_taken || '-';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* 메타 정보 헤더 */}
      <div className="rounded-md border border-primary-500 bg-blue-50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSimilarityBadgeVariant(result.score)}`}
            >
              Top-{result.rank}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSimilarityBadgeVariant(result.score)}`}
            >
              {getSimilarityLabel(result.score)} ({result.score}%)
            </span>
          </div>
          <span className="text-xs text-gray-600">
            {manualId.slice(0, 8)}... | {formatDate(result.created_at)}
          </span>
        </div>

        <h4 className="text-sm font-bold text-gray-900">{subject}</h4>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>원본 상담 ID:</span>
          <span className="font-semibold text-gray-900">{originalConsultationId || '-'}</span>
          {originalConsultationId && (
            <button
              type="button"
              onClick={() => onViewOriginal?.(originalConsultationId)}
              className="inline-flex items-center justify-center text-primary-500 hover:text-primary-600 transition"
              title="원본 상담 보기"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {keywords.map((keyword, idx) => (
              <span
                key={`${keyword}-${idx}`}
                className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-700 border-t border-gray-200 pt-2">
          <span>
            업무구분: <span className="font-semibold">{result.business_type || '-'}</span>
          </span>
          <span>
            에러코드: <span className="font-semibold">{result.error_code || '-'}</span>
          </span>
        </div>
      </div>

      {/* 배경 */}
      <div className="space-y-1">
        <h5 className="text-xs font-semibold text-gray-700">배경</h5>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900">
          {background}
        </div>
      </div>

      {/* 조치내역 */}
      <div className="space-y-1">
        <h5 className="text-xs font-semibold text-gray-700">조치내역</h5>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-line">
          {actionTaken}
        </div>
      </div>

      {/* 경고 메시지 (유사도 높을 때) */}
      {result.score >= 85 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <p className="font-semibold text-red-800">⚠️ 중복 상담 가능성 높음</p>
          <p className="text-xs text-red-700 mt-1">
            이 상담과 매우 유사한 기록이 존재합니다. 중복 등록이 아닌지 확인해주세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimilarResultDetail;

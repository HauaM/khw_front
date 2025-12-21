import { useState, useEffect } from 'react';
import { SimilarConsultationResult, BusinessType } from '@/lib/api/consultations';
import { searchManuals } from '@/lib/api/manuals';
import type { ManualSearchResult } from '@/types/manuals';

export interface UseSimilarConsultationsParams {
  inquiry_text: string;
  action_taken?: string;
  business_type?: BusinessType | '';
  error_code?: string;
  enabled?: boolean;
  debounceMs?: number;
  minLength?: number; // 기본값: 5자
}

export type SimilarSearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'insufficient';

export interface UseSimilarConsultationsReturn {
  results: SimilarConsultationResult[];
  status: SimilarSearchStatus;
  error: string | null;
  refetch: () => void;
  isLoading: boolean;
}

/**
 * 관련 메뉴얼 조회 커스텀 훅
 *
 * - inquiry_text가 minLength 이상일 때 자동 조회
 * - debounce 적용 (기본 500ms)
 * - enabled=false면 자동 조회 비활성화
 */
export const useSimilarConsultations = ({
  inquiry_text,
  action_taken,
  business_type,
  error_code,
  enabled = true,
  debounceMs = 1000,
  minLength = 4,
}: UseSimilarConsultationsParams): UseSimilarConsultationsReturn => {
  const [results, setResults] = useState<SimilarConsultationResult[]>([]);
  const [status, setStatus] = useState<SimilarSearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const mapManualResults = (items: ManualSearchResult[]): SimilarConsultationResult[] =>
    items.map((item, index) => {
      const manual = item.manual;
      return {
        rank: index + 1,
        score: Math.round(item.similarity_score * 100),
        consultation_id: manual.id,
        inquiry_text: manual.background || manual.topic,
        action_taken: manual.guideline || '',
        business_type: (manual.business_type_name || manual.business_type || null) as BusinessType | null,
        error_code: manual.error_code ?? null,
        created_at: manual.updated_at || manual.created_at,
        manual_id: manual.id,
        subject: manual.topic,
        keywords: manual.keywords || [],
        original_consultation_id: manual.source_consultation_id ?? null,
        metadata_fields: {
          manual_id: manual.id,
          manual_topic: manual.topic,
          source_consultation_id: manual.source_consultation_id ?? '',
        },
      };
    });

  const performSearch = async () => {
    const trimmedInquiry = inquiry_text?.trim() || '';

    // 입력 길이 부족
    if (trimmedInquiry.length < minLength) {
      setStatus('insufficient');
      setResults([]);
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const manualResults = await searchManuals({
        query: trimmedInquiry,
        business_type: business_type && business_type !== '' ? business_type : null,
        error_code: error_code?.trim() || null,
        status: 'APPROVED',
        top_k: 3,
      });

      setResults(mapManualResults(manualResults || []));
      setStatus('success');
    } catch (err) {
      console.error('Similar consultation search error:', err);
      setError('관련 메뉴얼 조회에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setStatus('error');
      setResults([]);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setResults([]);
      return undefined;
    }

    // 이전 타이머 정리
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const trimmedInquiry = inquiry_text?.trim() || '';

    // 길이 부족
    if (trimmedInquiry.length < minLength) {
      setStatus('insufficient');
      setResults([]);
      setError(null);
      return undefined;
    }

    // 디바운스 적용
    const timer = setTimeout(() => {
      performSearch();
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry_text, action_taken, business_type, error_code, enabled]);

  return {
    results,
    status,
    error,
    refetch: performSearch,
    isLoading: status === 'loading',
  };
};

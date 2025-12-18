import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ConsultationSearchForm from '@/components/search/ConsultationSearchForm';
import ConsultationResultTable from '@/components/table/ConsultationResultTable';
import ConsultationDetailModal from '@/components/modals/ConsultationDetailModal';
import Spinner from '@/components/common/Spinner';
import { useToast } from '@/components/common/Toast';
import {
  Consultation,
  ConsultationSearchParams,
  PaginationInfo,
} from '@/types/consultations';

interface ApiConsultation {
  id: string;
  branch_code: string;
  employee_id?: string;
  employee_name?: string;
  screen_id?: string;
  transaction_name?: string;
  business_type: string | null;
  error_code: string | null;
  inquiry_text: string;
  summary?: string;
  action_taken?: string;
  created_at: string;
}

interface ConsultationSearchApiResultItem {
  consultation: ApiConsultation;
  score?: number;
}

interface ConsultationSearchApiResultData {
  results?: ConsultationSearchApiResultItem[];
  total_found?: number;
  query?: string;
}

interface ConsultationSearchApiResponse {
  success: boolean;
  data?: ConsultationSearchApiResultData | null;
  error?: {
    message?: string;
  } | null;
}

const BRANCH_MAP: Record<string, string> = {
  '001': '본점영업부',
  '002': '강남지점',
  '003': '여의도지점',
  '004': '부산지점',
  '005': '대전지점',
};

type PageStatus = 'idle' | 'loading' | 'success' | 'empty';

const DEFAULT_TOP_K = 20;

const ConsultationSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queryParams, setQueryParams] = useSearchParams();
  const { showToast } = useToast();
  const [status, setStatus] = useState<PageStatus>('idle');
  const [results, setResults] = useState<Consultation[]>([]);
  const [searchParams, setSearchParams] = useState<ConsultationSearchParams | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: DEFAULT_TOP_K,
  });
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // 쿼리 파라미터에서 detail ID 읽기
  const detailId = queryParams.get('detail');

  /**
   * detailId가 변경되면 results에서 해당 상담 찾기
   */
  useEffect(() => {
    if (detailId) {
      const found = results.find((c) => c.id === detailId);
      setSelectedConsultation(found || null);
    } else {
      setSelectedConsultation(null);
    }
  }, [detailId, results]);

  const branchOptions = useMemo(
    () => Object.entries(BRANCH_MAP).map(([code, name]) => ({ code, name })),
    []
  );

  const resolveBranchName = (code: string, fallback?: string) => BRANCH_MAP[code] ?? fallback ?? code;

  /**
   * 상담 상세조회에서 돌아올 때 검색 상태 복원
   */
  useEffect(() => {
    const restoreSessionId = (location.state as any)?.restoreSessionId;
    if (restoreSessionId) {
      const saved = sessionStorage.getItem(restoreSessionId);
      if (saved) {
        try {
          const { results: savedResults, searchParams: savedParams, pagination: savedPagination } = JSON.parse(saved);
          setResults(savedResults);
          setSearchParams(savedParams);
          setPagination(savedPagination);
          setStatus('success');
        } catch (err) {
          console.error('검색 상태 복원 실패:', err);
        }
      }
    }
  }, [location.state]);

  const handleSearch = (params: ConsultationSearchParams) => {
    if (!params.query || params.query.trim().length === 0) {
      showToast({ message: '검색어를 입력해 주세요.', code: 'VALIDATION.ERROR' }, 'error');
      return;
    }

    if (params.startDate && params.endDate && params.startDate > params.endDate) {
      showToast('시작일이 종료일보다 늦습니다. 기간을 다시 확인해주세요.', 'error');
      return;
    }

    const normalizedParams: ConsultationSearchParams = {
      ...params,
      page: 1,
      itemsPerPage: DEFAULT_TOP_K,
    };
    setSearchParams(normalizedParams);
    setStatus('loading');

    const search = async () => {
      let errorToastShown = false;

      const showApiErrorToast = (payload: any) => {
        if (payload && payload.error) {
          const code = payload.error.code;
          const hint = payload.error.hint;
          const message = payload.error.message || '상담 검색에 실패했습니다.';
          showToast({ message: hint || message, code }, 'error');
          errorToastShown = true;
        }
      };

      try {
        const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const url = new URL('/api/v1/consultations/search', base);
        const searchParams = new URLSearchParams();
        searchParams.set('query', normalizedParams.query);
        if (normalizedParams.branchCode) searchParams.set('branch_code', normalizedParams.branchCode);
        if (normalizedParams.businessType) searchParams.set('business_type', normalizedParams.businessType);
        if (normalizedParams.errorCode) searchParams.set('error_code', normalizedParams.errorCode);
        if (normalizedParams.startDate) searchParams.set('start_date', normalizedParams.startDate);
        if (normalizedParams.endDate) searchParams.set('end_date', normalizedParams.endDate);
        searchParams.set('top_k', String(normalizedParams.itemsPerPage ?? DEFAULT_TOP_K));

        url.search = searchParams.toString();

        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          // 실패 응답을 API 공통 규격에 맞춰 파싱 시도
          try {
            const payload = (await res.json()) as ConsultationSearchApiResponse;
            if (payload && payload.success === false) {
              showApiErrorToast(payload);
              throw new Error(payload.error?.message || `검색 실패: ${res.status}`);
            }
          } catch (parseErr) {
            // JSON이 아니거나 파싱 실패 시 본문 텍스트로 fallback
            const errorText = await res.text();
            throw new Error(`검색 실패: ${res.status} ${errorText}`);
          }
        }

        const payload: ConsultationSearchApiResponse = await res.json();
        if (!payload.success) {
          showApiErrorToast(payload);
          throw new Error(payload.error?.message ?? '상담 검색에 실패했습니다.');
        }

        const apiData = payload.data;
        if (!apiData) {
          throw new Error('검색 결과가 없습니다. 다시 시도해주세요.');
        }

        const mapped: Consultation[] = (apiData.results ?? []).map((item) => ({
          id: item.consultation.id,
          branchCode: item.consultation.branch_code,
          branchName: resolveBranchName(item.consultation.branch_code),
          employeeId: item.consultation.employee_id,
          employeeName: item.consultation.employee_name,
          screenId: item.consultation.screen_id,
          transactionName: item.consultation.transaction_name,
          businessType: (item.consultation.business_type || 'OTHER') as Consultation['businessType'],
          errorCode: item.consultation.error_code || '',
          inquiryText: item.consultation.inquiry_text,
          summary: item.consultation.summary,
          actionTaken: item.consultation.action_taken,
          similarityScore: Math.round((item.score || 0) * 100),
          createdAt: item.consultation.created_at,
        }));

        const totalFound = apiData.total_found ?? mapped.length;
        const newSessionId = `search_${Date.now()}`;
        const sessionData = {
          results: mapped,
          searchParams: normalizedParams,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: totalFound,
            itemsPerPage: mapped.length,
          },
        };
        sessionStorage.setItem(newSessionId, JSON.stringify(sessionData));

        setResults(mapped);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: totalFound,
          itemsPerPage: mapped.length,
        });
        setStatus(mapped.length ? 'success' : 'empty');
      } catch (error) {
        console.error(error);
        if (!errorToastShown) {
          showToast(
            error instanceof Error
              ? { message: error.message }
              : { message: '검색 중 오류가 발생했습니다.' },
            'error'
          );
        }
        setResults([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: DEFAULT_TOP_K });
        setStatus('empty');
      }
    };

    void search();
  };

  const handlePageChange = (page: number) => {
    // 서버 페이지네이션 미지원 상태에서는 그대로 1페이지 유지
    if (!searchParams) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleRowClick = (consultation: Consultation) => {
    setQueryParams({ detail: consultation.id });
  };

  const handleCloseModal = () => {
    setQueryParams({});
  };

  const handleManualDraftCreated = (draftId: string) => {
    navigate(`/manuals/draft/${draftId}`, {
      state: { searchReturnPath: '/consultations/search' },
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">상담 검색</h1>
        <p className="text-gray-600">조건을 입력해 상담 내역을 검색할 수 있습니다.</p>
      </header>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 ">검색 조건</h2>
          </div>
        </div>
        <ConsultationSearchForm onSearch={handleSearch} branchOptions={branchOptions} />
      </section>

      <section>
        {status === 'loading' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 flex flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-gray-600">검색 중입니다. 잠시만 기다려주세요.</p>
          </div>
        )}

        {status === 'idle' && (
          <StateCard
            title="검색 조건을 입력하세요"
            description="검색어와 필터를 설정한 뒤 검색을 실행하면 결과가 표시됩니다."
          />
        )}

        {status === 'empty' && (
          <StateCard
            title="검색 결과가 없습니다"
            description="조건을 완화하거나 다른 키워드로 다시 검색해보세요."
          />
        )}

        {status === 'success' && (
          <ConsultationResultTable
            data={results}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            resolveBranchName={resolveBranchName}
          />
        )}
      </section>

      {selectedConsultation && (
        <ConsultationDetailModal
          consultationId={selectedConsultation.id}
          isOpen={!!detailId}
          onClose={handleCloseModal}
          onManualDraftCreated={handleManualDraftCreated}
          isNew={true}
        />
      )}
    </div>
  );
};

const StateCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xl font-bold">
      ℹ
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 max-w-xl">{description}</p>
  </div>
);

export default ConsultationSearchPage;

import React, { useMemo, useState } from 'react';
import ConsultationSearchForm from '@/components/search/ConsultationSearchForm';
import ConsultationResultTable from '@/components/table/ConsultationResultTable';
import Spinner from '@/components/common/Spinner';
import Toast, { useToast } from '@/components/common/Toast';
import {
  Consultation,
  ConsultationSearchParams,
  PaginationInfo,
} from '@/types/consultations';

const BRANCH_MAP: Record<string, string> = {
  '001': '본점영업부',
  '002': '강남지점',
  '003': '여의도지점',
  '004': '부산지점',
  '005': '대전지점',
};

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'CST-20240101-0001',
    branchCode: '001',
    branchName: '본점영업부',
    businessType: 'DEPOSIT',
    errorCode: 'ERR-001',
    inquiryText: '인터넷뱅킹 로그인 시 인증서 오류 발생',
    similarityScore: 92,
    createdAt: '2024-02-01T09:12:00Z',
  },
  {
    id: 'CST-20240101-0002',
    branchCode: '002',
    branchName: '강남지점',
    businessType: 'LOAN',
    errorCode: 'LN-201',
    inquiryText: '주택담보대출 금리 변경 관련 문의',
    similarityScore: 78,
    createdAt: '2024-02-02T12:30:00Z',
  },
  {
    id: 'CST-20240101-0003',
    branchCode: '003',
    branchName: '여의도지점',
    businessType: 'CARD',
    errorCode: 'CD-101',
    inquiryText: '법인카드 한도 초과 오류 발생',
    similarityScore: 63,
    createdAt: '2024-02-03T14:10:00Z',
  },
  {
    id: 'CST-20240101-0004',
    branchCode: '004',
    branchName: '부산지점',
    businessType: 'INTERNET',
    errorCode: 'WEB-500',
    inquiryText: '공동인증서 갱신 후 로그인 불가',
    similarityScore: 45,
    createdAt: '2024-02-04T08:45:00Z',
  },
  {
    id: 'CST-20240101-0005',
    branchCode: '005',
    branchName: '대전지점',
    businessType: 'MOBILE',
    errorCode: 'MB-010',
    inquiryText: '모바일뱅킹 이체 시 본인인증 실패',
    similarityScore: 86,
    createdAt: '2024-02-05T11:05:00Z',
  },
];

type PageStatus = 'idle' | 'loading' | 'success' | 'empty';

const ITEMS_PER_PAGE = 10;

const ConsultationSearchPage: React.FC = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [status, setStatus] = useState<PageStatus>('idle');
  const [results, setResults] = useState<Consultation[]>([]);
  const [searchParams, setSearchParams] = useState<ConsultationSearchParams | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const branchOptions = useMemo(
    () => Object.entries(BRANCH_MAP).map(([code, name]) => ({ code, name })),
    []
  );

  const resolveBranchName = (code: string, fallback?: string) => BRANCH_MAP[code] ?? fallback ?? code;

  const filterData = (params: ConsultationSearchParams) => {
    const { query, businessType, branchCode, errorCode, startDate, endDate } = params;

    return MOCK_CONSULTATIONS.filter((item) => {
      const matchesQuery = query
        ? [item.id, item.inquiryText].some((field) =>
            field.toLowerCase().includes(query.toLowerCase())
          )
        : true;

      const matchesBusiness = businessType ? item.businessType === businessType : true;
      const matchesBranch = branchCode ? item.branchCode === branchCode : true;
      const matchesError = errorCode
        ? item.errorCode.toLowerCase().includes(errorCode.toLowerCase())
        : true;

      const created = new Date(item.createdAt).getTime();
      const startOk = startDate ? created >= new Date(startDate).getTime() : true;
      const endOk = endDate ? created <= new Date(endDate).getTime() + 86_399_000 : true;

      return matchesQuery && matchesBusiness && matchesBranch && matchesError && startOk && endOk;
    });
  };

  const applyPagination = (data: Consultation[], page: number, itemsPerPage: number) => {
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paged = data.slice(startIndex, startIndex + itemsPerPage);

    return { paged, pagination: { totalItems, totalPages, currentPage, itemsPerPage } };
  };

  const handleSearch = (params: ConsultationSearchParams) => {
    if (params.startDate && params.endDate && params.startDate > params.endDate) {
      showToast('시작일이 종료일보다 늦습니다. 기간을 다시 확인해주세요.', 'error');
      return;
    }

    setStatus('loading');
    const normalizedParams: ConsultationSearchParams = {
      ...params,
      page: params.page ?? 1,
      itemsPerPage: params.itemsPerPage ?? ITEMS_PER_PAGE,
    };
    setSearchParams(normalizedParams);

    // 실제 API 연동 시 여기서 비동기 호출
    setTimeout(() => {
      const filtered = filterData(normalizedParams);
      const { paged, pagination: pagInfo } = applyPagination(
        filtered,
        normalizedParams.page ?? 1,
        normalizedParams.itemsPerPage ?? ITEMS_PER_PAGE
      );

      setResults(paged);
      setPagination(pagInfo);
      setStatus(filtered.length ? 'success' : 'empty');
    }, 400);
  };

  const handlePageChange = (page: number) => {
    if (!searchParams) return;
    handleSearch({ ...searchParams, page });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">상담 검색</h1>
        <p className="text-gray-600">조건을 입력해 상담 내역을 검색할 수 있습니다.</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">검색 조건</h2>
            <p className="text-sm text-gray-500">검색어, 업무구분, 기간 등으로 세분화 검색</p>
          </div>
        </div>
        <ConsultationSearchForm onSearch={handleSearch} branchOptions={branchOptions} />
      </section>

      <section>
        {status === 'loading' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center justify-center gap-3">
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
            resolveBranchName={resolveBranchName}
          />
        )}
      </section>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const StateCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xl font-bold">
      ℹ
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 max-w-xl">{description}</p>
  </div>
);

export default ConsultationSearchPage;

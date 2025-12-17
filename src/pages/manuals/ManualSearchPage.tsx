import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualSearchParams } from '@/types/manuals';
import { useToast } from '@/contexts/ToastContext';
import ManualSearchForm from '@/components/manuals/ManualSearchForm';
import ManualSearchResults from '@/components/manuals/ManualSearchResults';
import { useManualSearch } from '@/hooks/useManualSearch';

/**
 * 메뉴얼 검색 페이지
 *
 * OpenAPI: GET /api/v1/manuals/search 호출
 * 기능:
 * - 검색 조건 입력 (쿼리, 업무구분, 에러코드)
 * - 메뉴얼 벡터 검색 API 호출
 * - 검색 결과 테이블 렌더링
 * - 행 클릭 시 상세 페이지로 이동 (TODO)
 */
const ManualSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading, isSearched, search, reset } = useManualSearch();

  // 검색 파라미터 상태 관리
  // OpenAPI GET /api/v1/manuals/search의 query parameters와 일치
  const [searchParams, setSearchParams] = useState<ManualSearchParams>({
    query: '',
    business_type: null,
    error_code: null,
  });

  // 검색 파라미터 변경
  const handleParamsChange = (next: ManualSearchParams) => {
    setSearchParams(next);
  };

  // 검색 버튼 클릭
  const handleSearch = async () => {
    try {
      await search(searchParams);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '검색 중 오류가 발생했습니다. 다시 시도해주세요.';
      showToast(message, 'error');
    }
  };

  // 초기화 버튼 클릭
  const handleReset = () => {
    setSearchParams({
      query: '',
      business_type: null,
      error_code: null,
    });
    reset();
  };

  // 테이블 행 클릭
  const handleRowClick = (manualId: string) => {
    // 승인된 메뉴얼 페이지로 이동 (manual_id 파라미터 전달)
    navigate(`/manuals/approved?manual_id=${manualId}`);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">메뉴얼 검색</h1>
        <p className="text-sm text-gray-600">VectorStore 기반 메뉴얼 검색 및 조회</p>
      </div>

      {/* 검색 폼 */}
      <ManualSearchForm
        value={searchParams}
        onChange={handleParamsChange}
        onSearch={handleSearch}
        onReset={handleReset}
        isLoading={isLoading}
      />

      {/* 검색 결과 */}
      <ManualSearchResults
        results={data}
        isLoading={isLoading}
        isSearched={isSearched}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ManualSearchPage;

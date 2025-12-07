import React from 'react';
import { ManualSearchParams, ManualBusinessType } from '@/types/manuals';
import Spinner from '@/components/common/Spinner';

interface ManualSearchFormProps {
  value: ManualSearchParams;
  onChange: (next: ManualSearchParams) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
}

/**
 * OpenAPI BusinessType enum
 * "인터넷뱅킹", "모바일뱅킹", "대출", "예금", "카드"
 */
const BUSINESS_TYPES: ManualBusinessType[] = ['', '인터넷뱅킹', '모바일뱅킹', '대출', '예금', '카드'];

/**
 * 메뉴얼 검색 폼 컴포넌트
 * 검색 조건 입력 및 초기화/검색 버튼을 포함합니다.
 */
const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
  value,
  onChange,
  onSearch,
  onReset,
  isLoading,
}) => {
  const handleInputChange = (field: keyof ManualSearchParams, val: string | number | null) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      {/* 카드 헤더 */}
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
        <svg className="h-5 w-5 text-[#005BAC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        검색 조건
      </h3>

      {/* 검색어 필드 (full-width) */}
      <div className="mb-5 grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="query" className="text-[13px] font-semibold text-gray-700">
            검색어
          </label>
          <input
            id="query"
            type="text"
            className="min-h-[40px] rounded-md border border-gray-400 px-3 text-sm focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20"
            placeholder="키워드, 주제, 내용 등을 입력하세요"
            value={value.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* 업무구분, 에러코드 (2열) */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="business_type" className="text-[13px] font-semibold text-gray-700">
            업무구분
          </label>
          <select
            id="business_type"
            className="min-h-[40px] rounded-md border border-gray-400 px-3 text-sm bg-white focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20"
            value={value.business_type || ''}
            onChange={(e) => handleInputChange('business_type', e.target.value || null)}
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type || 'empty'} value={type}>
                {type || '전체'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="error_code" className="text-[13px] font-semibold text-gray-700">
            에러코드
          </label>
          <input
            id="error_code"
            type="text"
            className="min-h-[40px] rounded-md border border-gray-400 px-3 text-sm focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20"
            placeholder="예: E001, E102"
            value={value.error_code || ''}
            onChange={(e) => handleInputChange('error_code', e.target.value || null)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-gray-400 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          초기화
        </button>

        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#005BAC] px-6 text-sm font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="text-white" />
              검색 중...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              검색하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualSearchForm;

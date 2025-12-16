import React from 'react';
import { ManualSearchResult } from '@/types/manuals';

interface ManualSearchResultsProps {
  results: ManualSearchResult[];
  isLoading: boolean;
  isSearched: boolean;
  onRowClick: (manualId: string) => void;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 메뉴얼 검색 결과 컴포넌트
 * 로딩, 빈 상태, 결과 테이블을 렌더링합니다.
 */
const ManualSearchResults: React.FC<ManualSearchResultsProps> = ({
  results,
  isLoading,
  isSearched,
  onRowClick,
}) => {
  // results가 undefined인 경우 빈 배열로 기본값 설정
  const safeResults = results || [];

  return (
    <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
      {/* 결과 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">검색 결과</h3>
        {isSearched && !isLoading && (
          <div className="text-[13px] text-gray-600">
            총 <span className="font-bold text-[#005BAC]">{safeResults.length}</span>건
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 inline-flex">
            <svg className="h-12 w-12 animate-spin text-[#005BAC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" fill="none" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">메뉴얼을 검색하고 있습니다...</p>
        </div>
      )}

      {/* 검색 전 - Empty State */}
      {!isLoading && !isSearched && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="mb-4 h-16 w-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <h4 className="mb-2 text-base font-semibold text-gray-700">검색 조건을 입력하세요</h4>
          <p className="text-sm text-gray-600">키워드, 업무구분, 에러코드 등을 입력하여 메뉴얼을 검색할 수 있습니다</p>
        </div>
      )}

      {/* 검색 결과 없음 - Empty State */}
      {!isLoading && isSearched && safeResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="mb-4 h-16 w-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h4 className="mb-2 text-base font-semibold text-gray-700">검색 결과가 없습니다</h4>
          <p className="text-sm text-gray-600">다른 검색 조건으로 다시 시도해보세요</p>
        </div>
      )}

      {/* 결과 테이블 */}
      {!isLoading && isSearched && safeResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y border-[#E0E0E0] bg-[#F5F7FB]">
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  주제
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  키워드
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  업무
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  에러코드
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  유사도
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-gray-700">
                  수정일
                </th>
              </tr>
            </thead>
            <tbody>
              {safeResults.map((result) => (
                <tr
                  key={result.manual.id}
                  onClick={() => onRowClick(result.manual.id)}
                  className="cursor-pointer border-b border-[#E0E0E0] transition-colors hover:bg-[#F5F7FB]"
                >
                  {/* Topic */}
                  <td className="max-w-[300px] px-4 py-4 align-middle text-sm text-gray-900">
                    <div className="truncate font-semibold">{result.manual.topic}</div>
                  </td>

                  {/* Keywords */}
                  <td className="px-4 py-4 align-middle text-sm">
                    <div className="flex max-w-[280px] flex-wrap gap-1">
                      {result.manual.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex whitespace-nowrap items-center rounded bg-[#E8F1FB] px-2 py-0.5 text-[12px] font-semibold text-[#005BAC]"
                        >
                          {keyword}
                        </span>
                      ))}
                      {result.manual.keywords.length > 3 && (
                        <span className="inline-flex whitespace-nowrap items-center rounded bg-[#E8F1FB] px-2 py-0.5 text-[12px] font-semibold text-[#005BAC]">
                          +{result.manual.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Business Type Name */}
                  <td className="px-4 py-4 align-middle text-sm">
                    <span className="inline-flex whitespace-nowrap items-center rounded bg-[#F5F5F5] px-2.5 py-1 text-[12px] font-semibold text-gray-800">
                      {result.manual.business_type_name || '-'}
                    </span>
                  </td>

                  {/* Error Code */}
                  <td className="px-4 py-4 align-middle text-sm">
                    <span className="font-mono text-[12px] text-gray-700">
                      {result.manual.error_code || '-'}
                    </span>
                  </td>

                  {/* Similarity Score */}
                  <td className="px-4 py-4 align-middle text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-[6px] w-[60px] overflow-hidden rounded-full bg-[#E0E0E0]">
                        <div
                          className="h-full rounded-full bg-[#005BAC] transition-all duration-300"
                          style={{ width: `${result.similarity_score * 100}%` }}
                        />
                      </div>
                      <span className="min-w-[40px] text-[12px] font-semibold text-gray-700">
                        {(result.similarity_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Updated Date */}
                  <td className="px-4 py-4 align-middle text-sm">
                    <span className="whitespace-nowrap text-[13px] text-gray-600">
                      {formatDate(result.manual.updated_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManualSearchResults;

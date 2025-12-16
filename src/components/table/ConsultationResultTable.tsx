import React from 'react';
import { Consultation, PaginationInfo } from '@/types/consultations';
import Pagination from '@/components/common/Pagination';

interface ConsultationResultTableProps {
  data: Consultation[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onRowClick: (consultation: Consultation) => void;
  resolveBranchName: (code: string, fallback?: string) => string;
}

const businessTypeLabel: Record<Consultation['businessType'], string> = {
  DEPOSIT: '수신',
  LOAN: '여신',
  CARD: '카드',
  EXCHANGE: '환전',
  INTERNET: '인터넷뱅킹',
  MOBILE: '모바일뱅킹',
  OTHER: '기타',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const ConsultationResultTable: React.FC<ConsultationResultTableProps> = ({
  data,
  pagination,
  onPageChange,
  onRowClick,
  resolveBranchName,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">검색 결과</h3>
          <p className="text-sm text-gray-500">총 {pagination.totalItems}건</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-semibold">상담 ID</th>
              <th className="px-6 py-3 font-semibold">영업점</th>
              <th className="px-6 py-3 font-semibold">업무구분</th>
              <th className="px-6 py-3 font-semibold">에러코드</th>
              <th className="px-6 py-3 font-semibold">문의내용</th>
              <th className="px-6 py-3 font-semibold">유사도 점수</th>
              <th className="px-6 py-3 font-semibold">등록일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleString();
              const scoreColor = getScoreColor(item.similarityScore);
              const branchName = resolveBranchName(item.branchCode, item.branchName);

              return (
                <tr
                  key={item.id}
                  onClick={() => onRowClick(item)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-semibold text-primary-700">{item.id}</td>
                  <td className="px-6 py-4">{branchName}</td>
                  <td className="px-6 py-4">{businessTypeLabel[item.businessType]}</td>
                  <td className="px-6 py-4">{item.errorCode || '-'}</td>
                  <td className="px-6 py-4 text-gray-800">{item.inquiryText}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Score</span>
                        <span className="font-semibold text-gray-900">{item.similarityScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`${scoreColor} h-full rounded-full transition-all`}
                          style={{ width: `${Math.min(item.similarityScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formattedDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ConsultationResultTable;

import React from 'react';

interface ConsultationMetadataTableProps {
  metadata: Record<string, string>;
}

const ConsultationMetadataTable: React.FC<ConsultationMetadataTableProps> = ({ metadata }) => {
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  return (
    <section className="bg-white rounded-lg shadow-sm p-5 max-w-[1200px] mb-4 border border-gray-100">
      <header className="text-[16px] font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-primary-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span>추가 정보 (메타데이터)</span>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f5f7fb]">
            <tr>
              <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-700 border-b-2 border-gray-200 w-1/3">
                키
              </th>
              <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-700 border-b-2 border-gray-200">
                값
              </th>
            </tr>
          </thead>
          <tbody>
            {!hasMetadata && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-400 italic" colSpan={2}>
                  추가 정보 없음
                </td>
              </tr>
            )}
            {hasMetadata &&
              Object.entries(metadata).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b border-gray-200 font-semibold text-primary-700">{key}</td>
                  <td className="px-3 py-2 border-b border-gray-200 text-gray-900">{value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ConsultationMetadataTable;

import React, { useState } from 'react';

interface ApprovedManualHeaderProps {
  onSearchManualId: (manualId: string) => void;
  onFilterChange: (query: string) => void;
}

const ApprovedManualHeader: React.FC<ApprovedManualHeaderProps> = ({
  onSearchManualId,
  onFilterChange,
}) => {
  const [manualIdInput, setManualIdInput] = useState('');
  const [filterInput, setFilterInput] = useState('');

  const handleSearch = () => {
    const trimmedId = manualIdInput.trim();
    if (!trimmedId) return;
    onSearchManualId(trimmedId);
    setManualIdInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterInput(value);
    onFilterChange(value);
  };

  const handleClearFilter = () => {
    setFilterInput('');
    onFilterChange('');
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-gray-700">Manual 검색</div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,auto)]">
        <div className="flex flex-col gap-1">
          <label htmlFor="manualIdInput" className="text-xs font-semibold text-gray-600">
            Manual ID
          </label>
          <input
            id="manualIdInput"
            type="text"
            value={manualIdInput}
            onChange={(event) => setManualIdInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Manual ID를 입력하세요"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        >
          이동
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,auto)]">
        <div className="flex flex-col gap-1">
          <label htmlFor="manualFilterInput" className="text-xs font-semibold text-gray-600">
            주제 · 키워드 필터
          </label>
          <input
            id="manualFilterInput"
            type="text"
            value={filterInput}
            onChange={(event) => handleFilterChange(event.target.value)}
            placeholder="주제 또는 키워드를 입력하세요"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleClearFilter}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default ApprovedManualHeader;

import React, { useState } from 'react';

interface ApprovedManualHeaderProps {
  onSearch: (query: string) => void;
}

const ApprovedManualHeader: React.FC<ApprovedManualHeaderProps> = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    const trimmed = input.trim();
    onSearch(trimmed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-gray-700">Manual 검색</div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,auto)] items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="manualSearchInput" className="text-xs font-semibold text-gray-600">
            Manual ID · 주제 · 키워드
          </label>
          <input
            id="manualSearchInput"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Manual ID 또는 주제/키워드를 입력하세요"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        >
          검색
        </button>
      </div>
    </div>
  );
};

export default ApprovedManualHeader;

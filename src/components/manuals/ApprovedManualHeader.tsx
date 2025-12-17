import React, { useState } from 'react';

interface ApprovedManualHeaderProps {
  onSearchManualId: (manualId: string) => void;
}

const ApprovedManualHeader: React.FC<ApprovedManualHeaderProps> = ({ onSearchManualId }) => {
  const [manualIdInput, setManualIdInput] = useState('');

  const handleSubmit = () => {
    const trimmedId = manualIdInput.trim();
    onSearchManualId(trimmedId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="manualIdInput" className="text-xs font-semibold text-gray-700">
            Manual ID로 이동
          </label>
          <input
            id="manualIdInput"
            type="text"
            placeholder="Manual ID를 입력하세요"
            value={manualIdInput}
            onChange={(event) => setManualIdInput(event.target.value)}
            onKeyDown={handleKeyDown}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="min-w-[120px] rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        >
          이동
        </button>
      </div>
    </div>
  );
};

export default ApprovedManualHeader;

import React, { useState } from 'react';

interface ApprovedManualHeaderProps {
  businessType: string;
  errorCode: string;
  onSearchManualId: (manualId: string) => void;
}

/**
 * 승인된 메뉴얼 목록 화면의 헤더
 * - 제목 및 부제 (업무 구분 / 에러코드)
 * - manual_id 입력창 + "이동" 버튼
 */
const ApprovedManualHeader: React.FC<ApprovedManualHeaderProps> = ({
  businessType,
  errorCode,
  onSearchManualId,
}) => {
  const [manualIdInput, setManualIdInput] = useState('');

  const handleSearchClick = () => {
    const trimmed = manualIdInput.trim();
    if (trimmed) {
      onSearchManualId(trimmed);
      setManualIdInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      {/* 좌측: 제목 및 부제 */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">승인된 메뉴얼</h1>
        <p className="mt-1 text-sm text-gray-600">
          업무구분: <span className="font-semibold">{businessType}</span> /
          에러코드: <span className="font-semibold">{errorCode}</span>
        </p>
      </div>

      {/* 우측: 입력창 + 버튼 */}
      <div className="flex gap-2">
        <input
          type="text"
          id="manualIdInput"
          placeholder="Manual ID 입력"
          value={manualIdInput}
          onChange={(e) => setManualIdInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          style={{ minWidth: '280px' }}
        />
        <button
          onClick={handleSearchClick}
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition"
        >
          이동
        </button>
      </div>
    </div>
  );
};

export default ApprovedManualHeader;

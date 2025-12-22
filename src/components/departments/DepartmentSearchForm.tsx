import React, { useState } from 'react';

interface DepartmentSearchFormProps {
  onSearch: (params: {
    department_name?: string;
    department_code?: string;
    is_active?: boolean;
  }) => void;
  onReset: () => void;
}

const DepartmentSearchForm: React.FC<DepartmentSearchFormProps> = ({ onSearch, onReset }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  const handleSearch = () => {
    onSearch({
      department_name: departmentName.trim() || undefined,
      department_code: departmentCode.trim() || undefined,
    });
  };

  const handleReset = () => {
    setDepartmentName('');
    setDepartmentCode('');
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">검색조건</h3>
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-1">
          <label htmlFor="searchDeptName" className="text-xs font-semibold text-gray-700">
            부서명
          </label>
          <input
            type="text"
            id="searchDeptName"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="부서명을 입력하세요"
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="searchDeptCode" className="text-xs font-semibold text-gray-700">
            부서코드
          </label>
          <input
            type="text"
            id="searchDeptCode"
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="부서코드를 입력하세요"
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition bg-primary-500 text-white hover:bg-primary-600"
          >
            조회
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition bg-white text-primary-500 border border-primary-500 hover:bg-primary-50"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSearchForm;

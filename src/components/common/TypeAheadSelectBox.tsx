import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface TypeAheadOption {
  code: string;
  label: string;
  description?: string;
}

export interface TypeAheadSelectBoxProps {
  options: TypeAheadOption[];
  selectedCode?: string;
  value?: string;
  onChange: (code: string, label: string) => void;
  onAddNew?: (searchTerm: string) => void;
  placeholder?: string;
  error?: string;
  allowCreate?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const TypeAheadSelectBox: React.FC<TypeAheadSelectBoxProps> = ({
  options,
  selectedCode,
  value,
  onChange,
  onAddNew,
  placeholder = '검색 또는 선택하세요',
  error,
  allowCreate = true,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<TypeAheadOption[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 필터링 로직
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = options.filter(
      (item) =>
        item.code.toLowerCase().includes(term) ||
        item.label.toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // 외부 클릭으로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback(
    (code: string, label: string) => {
      onChange(code, label);
      setSearchTerm('');
      setIsOpen(false);
    },
    [onChange]
  );

  const handleAddNew = useCallback(() => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  }, [onAddNew, searchTerm]);

  const showAddNewOption = allowCreate && searchTerm.trim() !== '' && filteredOptions.length === 0;

  return (
    <div ref={containerRef} className="relative">
      {/* 입력 필드 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || value}
          onChange={(e) => {
            setSearchTerm(e.currentTarget.value);
            setIsOpen(true);
          }}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'min-h-[36px] w-full rounded border px-3 pr-10 text-[14px] text-gray-900 outline-none transition',
            error
              ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-100'
              : 'border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-200',
            disabled ? 'cursor-not-allowed bg-gray-100' : '',
          ].join(' ')}
          autoComplete="off"
        />
        {/* 드롭다운 아이콘 */}
        <svg
          className={[
            'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 transition-transform pointer-events-none',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-1000 mt-1 max-h-60 overflow-y-auto rounded border border-gray-400 bg-white shadow-md">
          {isLoading ? (
            <div className="flex items-center justify-center px-3 py-8">
              <div className="text-[13px] text-gray-600">로드 중...</div>
            </div>
          ) : filteredOptions.length === 0 && !showAddNewOption ? (
            <div className="px-3 py-4 text-center text-[13px] text-gray-600">
              {searchTerm ? '일치하는 항목이 없습니다.' : ''}
            </div>
          ) : (
            <>
              {/* 옵션 목록 */}
              {filteredOptions.map((option) => (
                <div
                  key={option.code}
                  onClick={() => handleSelect(option.code, option.label)}
                  className={[
                    'cursor-pointer px-3 py-2 transition-colors',
                    selectedCode === option.code
                      ? 'bg-blue-50 text-[#005BAC] font-semibold'
                      : 'hover:bg-blue-50',
                  ].join(' ')}
                >
                  <div className="font-semibold text-[14px]">{option.label}</div>
                  <div className="text-[12px] text-gray-600">{option.code}</div>
                </div>
              ))}

              {/* "새 항목 추가" 옵션 */}
              {showAddNewOption && (
                <div
                  onClick={handleAddNew}
                  className="flex cursor-pointer items-center gap-2 border-t border-gray-200 px-3 py-2 text-[#005BAC] transition-colors hover:bg-blue-50"
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-[13px] font-semibold">
                    새 항목 추가: "{searchTerm}"
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <div className="mt-1 text-[12px] text-red-600">{error}</div>}
    </div>
  );
};

export default TypeAheadSelectBox;

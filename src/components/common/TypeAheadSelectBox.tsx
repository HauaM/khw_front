import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface TypeAheadOption {
  code: string;
  label: string;
  description?: string;
}

export interface TypeAheadSelectBoxProps {
  options: TypeAheadOption[];
  selectedCode?: string;
  onChange: (code: string, label?: string) => void;
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
  const [isFocused, setIsFocused] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<TypeAheadOption[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // selectedCode에 해당하는 label 찾기
  const selectedLabel = selectedCode && options.find(opt => opt.code === selectedCode)?.label;

  // 포커스 상태에 따라 표시할 값 결정
  // - 포커스: 사용자 입력(searchTerm) 표시
  // - 미포커스: 선택된 값(selectedLabel) 또는 입력값 표시
  const displayValue = isFocused ? searchTerm : (searchTerm || selectedLabel || '');

  // 필터링 로직
  useEffect(() => {
    const term = (searchTerm || '').toLowerCase();
    const filtered = options.filter(
      (item) =>
        (item.code || '').toLowerCase().includes(term) ||
        (item.label || '').toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(-1); // 필터링 시 하이라이트 초기화
  }, [searchTerm, options]);

  // 하이라이트된 항목이 변경되면 스크롤 조정
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.currentTarget.value;
      setSearchTerm(newValue);
      setIsOpen(true);

      // 사용자가 입력을 모두 지운 경우 선택 해제
      if (newValue === '' && selectedCode) {
        onChange('', '');
      }
    },
    [selectedCode, onChange]
  );

  const handleSelect = useCallback(
    (code: string, label: string) => {
      onChange(code, label);
      setSearchTerm('');
      setIsFocused(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleAddNew = useCallback(() => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setIsFocused(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [onAddNew, searchTerm]);

  const showAddNewOption = allowCreate && searchTerm.trim() !== '' && filteredOptions.length === 0;

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          setIsOpen(true);
          e.preventDefault();
        }
        return;
      }

      const totalOptions = filteredOptions.length + (showAddNewOption ? 1 : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : prev));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            const option = filteredOptions[highlightedIndex];
            handleSelect(option.code, option.label);
          } else if (highlightedIndex === filteredOptions.length && showAddNewOption) {
            handleAddNew();
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;

        default:
          break;
      }
    },
    [isOpen, filteredOptions, showAddNewOption, highlightedIndex, handleSelect, handleAddNew]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* 입력 필드 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            handleInputClick();
          }}
          onBlur={() => {
            setIsFocused(false);
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
              {filteredOptions.map((option, index) => (
                <div
                  key={option.code}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleSelect(option.code, option.label)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={[
                    'cursor-pointer px-3 py-2 transition-colors',
                    highlightedIndex === index
                      ? 'bg-blue-100 text-[#005BAC]'
                      : selectedCode === option.code
                      ? 'bg-blue-50 text-[#005BAC] font-semibold'
                      : 'hover:bg-blue-50',
                  ].join(' ')}
                >
                  <div className="font-semibold text-[14px]">{option.label}</div>
                  {/* <div className="text-[12px] text-gray-600">{option.code}</div> */}
                </div>
              ))}

              {/* "새 항목 추가" 옵션 */}
              {showAddNewOption && (
                <div
                  ref={(el) => (optionRefs.current[filteredOptions.length] = el)}
                  onClick={handleAddNew}
                  onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                  className={[
                    'flex cursor-pointer items-center gap-2 border-t border-gray-200 px-3 py-2 text-[#005BAC] transition-colors',
                    highlightedIndex === filteredOptions.length ? 'bg-blue-100' : 'hover:bg-blue-50',
                  ].join(' ')}
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

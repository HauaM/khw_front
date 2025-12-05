import React, { useEffect, useState } from 'react';
import { BusinessType, ConsultationSearchParams } from '@/types/consultations';

interface ConsultationSearchFormProps {
  defaultValues?: Partial<ConsultationSearchParams>;
  onSearch: (params: ConsultationSearchParams) => void;
  branchOptions?: Array<{ code: string; name: string }>;
}

const businessTypeOptions: Array<{ value: BusinessType; label: string }> = [
  { value: 'DEPOSIT', label: '수신' },
  { value: 'LOAN', label: '여신' },
  { value: 'CARD', label: '카드' },
  { value: 'EXCHANGE', label: '환전' },
  { value: 'INTERNET', label: '인터넷뱅킹' },
  { value: 'MOBILE', label: '모바일뱅킹' },
  { value: 'OTHER', label: '기타' },
];

const defaultFormState: ConsultationSearchParams = {
  query: '',
  businessType: '',
  branchCode: '',
  errorCode: '',
  startDate: '',
  endDate: '',
};

const ConsultationSearchForm: React.FC<ConsultationSearchFormProps> = ({
  defaultValues,
  onSearch,
  branchOptions = [],
}) => {
  const [formState, setFormState] = useState<ConsultationSearchParams>({
    ...defaultFormState,
    ...defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      setFormState((prev) => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    onSearch(defaultFormState);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">검색어</label>
          <input
            type="text"
            name="query"
            value={formState.query}
            onChange={handleChange}
            placeholder="문의 내용을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">업무구분</label>
          <select
            name="businessType"
            value={formState.businessType}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">전체</option>
            {businessTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">영업점</label>
          <select
            name="branchCode"
            value={formState.branchCode}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">전체</option>
            {branchOptions.map((branch) => (
              <option key={branch.code} value={branch.code}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">에러코드</label>
          <input
            type="text"
            name="errorCode"
            value={formState.errorCode}
            onChange={handleChange}
            placeholder="예: ERR-001"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">시작일</label>
          <input
            type="date"
            name="startDate"
            value={formState.startDate || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">종료일</label>
          <input
            type="date"
            name="endDate"
            value={formState.endDate || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
        >
          검색
        </button>
      </div>
    </form>
  );
};

export default ConsultationSearchForm;

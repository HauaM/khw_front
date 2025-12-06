import React from 'react';
import type { BusinessType, Consultation } from '@/lib/api/consultations';

type KnownBusinessType = 'DEPOSIT' | 'LOAN' | 'CARD' | 'EXCHANGE' | 'INTERNET' | 'MOBILE' | 'OTHER';

const businessTypeMap: Record<KnownBusinessType, { label: string; className: string }> = {
  DEPOSIT: {
    label: '예금',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  },
  LOAN: {
    label: '대출',
    className: 'bg-amber-50 text-amber-700 border border-amber-100',
  },
  CARD: {
    label: '카드',
    className: 'bg-purple-50 text-purple-700 border border-purple-100',
  },
  EXCHANGE: {
    label: '환전',
    className: 'bg-blue-50 text-blue-700 border border-blue-100',
  },
  INTERNET: {
    label: '인터넷뱅킹',
    className: 'bg-teal-50 text-teal-700 border border-teal-100',
  },
  MOBILE: {
    label: '모바일뱅킹',
    className: 'bg-rose-50 text-rose-700 border border-rose-100',
  },
  OTHER: {
    label: '기타',
    className: 'bg-slate-50 text-slate-700 border border-slate-100',
  },
};

const knownBusinessTypes: KnownBusinessType[] = [
  'DEPOSIT',
  'LOAN',
  'CARD',
  'EXCHANGE',
  'INTERNET',
  'MOBILE',
  'OTHER',
];

const isKnownBusinessType = (value: BusinessType): value is KnownBusinessType =>
  knownBusinessTypes.includes(value as KnownBusinessType);

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold text-gray-600 mb-1.5">{label}</span>
      <div className="text-[14px] text-gray-900 bg-[#f5f7fb] border border-gray-200 rounded px-3 py-2 min-h-[36px] flex items-center">
        {value}
      </div>
    </div>
  );
};

interface ConsultationDetailBasicInfoProps {
  consultation: Consultation;
}

const ConsultationDetailBasicInfo: React.FC<ConsultationDetailBasicInfoProps> = ({ consultation }) => {
  const businessTypeKey = isKnownBusinessType(consultation.business_type)
    ? consultation.business_type
    : 'OTHER';
  const businessType = businessTypeMap[businessTypeKey];

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
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M3 17l9-4 9 4" />
        </svg>
        <span>기본 정보</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField label="ID" value={consultation.id} />
        <DetailField label="등록일시" value={formatDateTime(consultation.created_at)} />
        <DetailField label="요청영업점" value={`${consultation.branch_code} (${consultation.branch_name})`} />
        <DetailField label="요청직원" value={`${consultation.employee_id} (${consultation.employee_name})`} />
        <DetailField label="화면번호" value={consultation.screen_id} />
        <DetailField label="거래명" value={consultation.transaction_name} />
        <DetailField
          label="업무구분"
          value={<span className={`inline-flex items-center rounded px-3 py-1 text-sm font-semibold ${businessType.className}`}>{businessType.label}</span>}
        />
        <DetailField label="에러코드" value={consultation.error_code} />
      </div>
    </section>
  );
};

export default ConsultationDetailBasicInfo;

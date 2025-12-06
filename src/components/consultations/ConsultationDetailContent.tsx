import React from 'react';
import type { Consultation } from '@/lib/api/consultations';

interface ConsultationDetailContentProps {
  consultation: Consultation;
}

const ContentField: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div className="flex flex-col">
    <span className="text-[13px] font-semibold text-gray-600 mb-1.5">{label}</span>
    <div className="text-[14px] text-gray-900 bg-[#f5f7fb] border border-gray-200 rounded px-3 py-3 min-h-[100px] whitespace-pre-wrap leading-relaxed">
      {text}
    </div>
  </div>
);

const ConsultationDetailContent: React.FC<ConsultationDetailContentProps> = ({ consultation }) => {
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
          <path d="M12 20h9" />
          <path d="M12 4h9" />
          <circle cx="5" cy="4" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="5" cy="20" r="2" />
          <path d="M7 4h3" />
          <path d="M7 12h14" />
          <path d="M7 20h4" />
        </svg>
        <span>상담 내용</span>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <ContentField label="문의내용" text={consultation.inquiry_text} />
        <ContentField label="조치내용" text={consultation.action_taken} />
      </div>
    </section>
  );
};

export default ConsultationDetailContent;

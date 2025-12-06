import React from 'react';
import ConsultationCreateForm from '../../components/consultations/ConsultationCreateForm';

const ConsultationCreatePage: React.FC = () => {
  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">상담 등록</h2>
        <p className="text-sm text-gray-600">고객 상담 내용을 입력하고 저장합니다</p>
      </div>
      <ConsultationCreateForm />
    </div>
  );
};

export default ConsultationCreatePage;

import React, { useState } from 'react';
import ConsultationCreateForm, {
  ConsultationFormValues,
} from '../../components/consultations/ConsultationCreateForm';
import SimilarComparePanel from '../../components/consultations/SimilarComparePanel';

/**
 * 상담 등록 페이지 (v3)
 *
 * - 왼쪽(6): 상담 등록 폼 (기존 v2 유지)
 * - 오른쪽(4): 관련 메뉴얼 조회 패널 (v3 추가)
 * - 6:4 레이아웃 (grid-cols-10 기준: col-span-6 / col-span-4)
 */
const ConsultationCreatePage: React.FC = () => {
  // 폼 데이터 상태 (SimilarComparePanel에 전달용)
  const [formData, setFormData] = useState<ConsultationFormValues>({
    branch_code: '',
    employee_id: '',
    screen_id: '',
    transaction_name: '',
    business_type: '',
    error_code: '',
    inquiry_text: '',
    action_taken: '',
    metadata_fields: {},
  });

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">상담 등록</h2>
        <p className="text-sm text-gray-600">
          고객 상담 내용을 입력하고 저장합니다. 관련 메뉴얼을 자동으로 조회하여 중복을 방지합니다.
        </p>
      </header>

      {/* 메인 컨텐츠: 6:4 레이아웃 */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[700px_500px] lg:justify-start">
        {/* 왼쪽(6): 상담 등록 폼 */}
        <div className="lg:max-w-[700px]">
          <ConsultationCreateForm formData={formData} setFormData={setFormData} />
        </div>

        {/* 오른쪽(4): 관련 메뉴얼 조회 패널 */}
        <div className="lg:max-w-[500px]">
          <SimilarComparePanel
            inquiryText={formData.inquiry_text}
            actionTaken={formData.action_taken}
            businessType={formData.business_type}
            errorCode={formData.error_code}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsultationCreatePage;

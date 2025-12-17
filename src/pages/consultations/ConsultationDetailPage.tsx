import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { Consultation as SearchConsultation } from '@/types/consultations';
import type { Consultation as ApiConsultation } from '@/lib/api/consultations';
import ConsultationDetailBasicInfo from '@/components/consultations/ConsultationDetailBasicInfo';
import ConsultationDetailContent from '@/components/consultations/ConsultationDetailContent';
import ConsultationMetadataTable from '@/components/consultations/ConsultationMetadataTable';
import Spinner from '@/components/common/Spinner';
import Toast, { useToast } from '@/components/common/Toast';
import useConsultationDetail from '@/hooks/useConsultationDetail';

interface LocationState {
  consultation?: SearchConsultation;
  searchSessionId?: string;
}

/**
 * camelCase 검색 결과를 snake_case API 포맷으로 변환
 */
const convertSearchResultToApiFormat = (consultation: SearchConsultation | undefined): ApiConsultation | null => {
  if (!consultation) return null;

  return {
    id: consultation.id,
    branch_code: consultation.branchCode,
    branch_name: consultation.branchName || '',
    employee_id: '',
    employee_name: '',
    screen_id: '',
    transaction_name: '',
    business_type: consultation.businessType,
    error_code: consultation.errorCode,
    inquiry_text: consultation.inquiryText,
    action_taken: consultation.actionTaken || '',
    created_at: consultation.createdAt,
    metadata_fields: {},
  };
};

const ConsultationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { consultation: stateConsultation } = (location.state || {}) as LocationState;

  // state에서 받은 데이터가 있으면 변환해서 사용, 없으면 API 호출
  const convertedStateData = convertSearchResultToApiFormat(stateConsultation);
  const { data: apiData, isLoading, isError, error } = useConsultationDetail(convertedStateData ? undefined : id);
  const data = convertedStateData || apiData;

  const { toasts, removeToast } = useToast();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/consultations/search');
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">상담 상세 조회</h1>
          <p className="text-gray-600">등록된 상담 내용을 확인하고 메뉴얼을 생성할 수 있습니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white text-primary-700 border border-primary-600 rounded-md min-h-[36px] px-4 text-sm font-semibold transition hover:bg-primary-50 flex items-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            이전으로
          </button>
        </div>
      </header>
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 flex items-center justify-center gap-3">
          <Spinner />
          <p className="text-gray-600">상담 정보를 불러오는 중입니다.</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-red-700">
          상담 정보를 불러오는 중 오류가 발생했습니다. {error?.message}
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <ConsultationDetailBasicInfo consultation={data} />
          <ConsultationDetailContent consultation={data} />
          <ConsultationMetadataTable metadata={data.metadata_fields} />
        </>
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isOpen
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ConsultationDetailPage;

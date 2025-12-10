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
import useCreateManualDraft from '@/hooks/useCreateManualDraft';
import { convertApiResponseToManualDraft } from '@/lib/api/manuals';

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
  const { consultation: stateConsultation, searchSessionId: stateSearchSessionId } = (location.state || {}) as LocationState;

  // state에서 받은 데이터가 있으면 변환해서 사용, 없으면 API 호출
  const convertedStateData = convertSearchResultToApiFormat(stateConsultation);
  const { data: apiData, isLoading, isError, error } = useConsultationDetail(convertedStateData ? undefined : id);
  const data = convertedStateData || apiData;

  const { toasts, showToast, removeToast } = useToast();

  const { mutate: createDraft, isLoading: isCreating } = useCreateManualDraft({
    onSuccess: (draftResponse) => {
      showToast('메뉴얼 초안이 생성되었습니다. 검토 페이지로 이동합니다.', 'success');
      const convertedDraft = convertApiResponseToManualDraft(draftResponse);
      setTimeout(() => {
        navigate(`/manuals/draft/${draftResponse.id}`, {
          state: { draft: convertedDraft },
        });
      }, 1500);
    },
    onError: (err) => {
      const message =
        err?.message || '메뉴얼 초안 생성 중 오류가 발생했습니다.';
      showToast(message, 'error');
    },
  });

  const handleBack = () => {
    if (stateSearchSessionId) {
      // 검색 상태가 있으면 복원하면서 돌아가기
      navigate('/consultations/search', {
        state: { restoreSessionId: stateSearchSessionId },
      });
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/consultations/search');
    }
  };

  const handleCreateDraft = () => {
    if (!data || isCreating) return;
    void createDraft(data);
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
            목록으로
          </button>
          <button
            type="button"
            disabled={!data || isCreating}
            onClick={handleCreateDraft}
            className="bg-primary-600 text-white rounded-md min-h-[36px] px-4 text-sm font-semibold transition hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Spinner size="sm" className="!text-white" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <span>메뉴얼 초안 생성</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="bg-[#e3f2fd] border-l-4 border-[#1976d2] rounded px-4 py-3 mb-2 flex items-start gap-3">
        <svg
          className="h-5 w-5 text-[#1976d2] mt-[2px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#1565c0]">메뉴얼 초안 생성 안내</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            이 상담 내용을 기반으로 AI가 메뉴얼 초안을 자동 생성합니다. 생성된 초안은 검토자의 승인 후 최종 메뉴얼로 게시됩니다.
          </p>
        </div>
      </div>

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

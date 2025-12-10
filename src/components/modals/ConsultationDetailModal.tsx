import React from 'react';
import type { Consultation as SearchConsultation } from '@/types/consultations';
import type { Consultation as ApiConsultation } from '@/lib/api/consultations';
import ConsultationDetailBasicInfo from '@/components/consultations/ConsultationDetailBasicInfo';
import ConsultationDetailContent from '@/components/consultations/ConsultationDetailContent';
import ConsultationMetadataTable from '@/components/consultations/ConsultationMetadataTable';
import Spinner from '@/components/common/Spinner';
import Toast, { useToast } from '@/components/common/Toast';
import useCreateManualDraft from '@/hooks/useCreateManualDraft';

interface ConsultationDetailModalProps {
  consultation: SearchConsultation;
  isOpen: boolean;
  onClose: () => void;
  onManualDraftCreated?: (draftId: string) => void;
}

/**
 * camelCase 검색 결과를 snake_case API 포맷으로 변환
 */
const convertSearchResultToApiFormat = (consultation: SearchConsultation): ApiConsultation => {
  return {
    id: consultation.id,
    branch_code: consultation.branchCode,
    branch_name: consultation.branchName || '',
    employee_id: consultation.employeeId || '',
    employee_name: consultation.employeeName || '',
    screen_id: consultation.screenId || '',
    transaction_name: consultation.transactionName || '',
    business_type: consultation.businessType,
    error_code: consultation.errorCode,
    inquiry_text: consultation.inquiryText,
    action_taken: consultation.actionTaken || '',
    created_at: consultation.createdAt,
    metadata_fields: {},
  };
};

const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  consultation,
  isOpen,
  onClose,
  onManualDraftCreated,
}) => {
  const { toasts, showToast, removeToast } = useToast();
  const convertedData = convertSearchResultToApiFormat(consultation);

  const { mutate: createDraft, isLoading: isCreating } = useCreateManualDraft({
    onSuccess: (draftResponse) => {
      showToast('메뉴얼 초안이 생성되었습니다. 검토 페이지로 이동합니다.', 'success');
      setTimeout(() => {
        onManualDraftCreated?.(draftResponse.id);
      }, 1500);
    },
    onError: (err) => {
      const message = err?.message || '메뉴얼 초안 생성 중 오류가 발생했습니다.';
      showToast(message, 'error');
    },
  });

  const handleCreateDraft = () => {
    if (isCreating) return;
    void createDraft(convertedData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">상담 상세 조회</h2>
              <p className="text-sm text-gray-600">등록된 상담 내용을 확인하고 메뉴얼을 생성할 수 있습니다</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isCreating}
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
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            <div className="bg-[#e3f2fd] border-l-4 border-[#1976d2] rounded px-4 py-3 flex items-start gap-3">
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

            <ConsultationDetailBasicInfo consultation={convertedData} />
            <ConsultationDetailContent consultation={convertedData} />
            <ConsultationMetadataTable metadata={convertedData.metadata_fields} />
          </div>

          {/* Toasts */}
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
      </div>
    </>
  );
};

export default ConsultationDetailModal;

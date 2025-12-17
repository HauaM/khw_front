import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import Toast, { ToastState, ToastType } from '../common/Toast';
import TypeAheadSelectBox from '../common/TypeAheadSelectBox';
import AddCodeModal from '../common/AddCodeModal';
import MetadataFields from './MetadataFields';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import {
  BusinessType as ApiBusinessType,
  ConsultationResponse as ApiConsultationResponse,
  createConsultation,
} from '@/lib/api/consultations';
import { createManualDraft, convertApiResponseToManualDraft } from '@/lib/api/manuals';

export type BusinessType = ApiBusinessType;

export interface ConsultationFormValues {
  branch_code: string;
  employee_id: string;
  screen_id: string;
  transaction_name: string;
  business_type: BusinessType | '';
  error_code: string;
  inquiry_text: string;
  action_taken: string;
  metadata_fields: Record<string, string>;
}

export type ConsultationResponse = Pick<ApiConsultationResponse, 'id' | 'created_at'>;

const initialValues: ConsultationFormValues = {
  branch_code: '',
  employee_id: '',
  screen_id: '',
  transaction_name: '',
  business_type: '',
  error_code: '',
  inquiry_text: '',
  action_taken: '',
  metadata_fields: {},
};

const ConsultationCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<ConsultationFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedConsultationId, setSavedConsultationId] = useState<string | null>(null);
  const [isCreatingManualDraft, setIsCreatingManualDraft] = useState(false);
  const [loadingDots, setLoadingDots] = useState(1);
  const [toast, setToast] = useState<ToastState>({
    type: 'success',
    message: '',
    isOpen: false,
  });

  // 공통코드 훅
  const {
    options: businessTypeOptions,
    isLoading: businessTypeLoading,
    addNewCode: addNewBusinessType,
  } = useCommonCodes('BUSINESS_TYPE');

  const {
    options: errorCodeOptions,
    isLoading: errorCodeLoading,
    addNewCode: addNewErrorCode,
  } = useCommonCodes('ERROR_CODE');

  // AddCodeModal 상태
  const [addCodeModalOpen, setAddCodeModalOpen] = useState(false);
  const [addCodeType, setAddCodeType] = useState<'BUSINESS_TYPE' | 'ERROR_CODE'>('BUSINESS_TYPE');
  const [addCodeLabel, setAddCodeLabel] = useState('');

  useEffect(() => {
    if (!isCreatingManualDraft) {
      setLoadingDots(1);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setLoadingDots((prev) => (prev % 3) + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isCreatingManualDraft]);

  const requiredFields = useMemo(
    () =>
      [
        { name: 'branch_code', label: '요청영업점' },
        { name: 'employee_id', label: '요청직원' },
        { name: 'screen_id', label: '화면번호' },
        { name: 'transaction_name', label: '거래명' },
        { name: 'business_type', label: '업무구분' },
        { name: 'error_code', label: '에러코드' },
        { name: 'inquiry_text', label: '문의내용' },
        { name: 'action_taken', label: '조치내용' },
      ] as Array<{ name: keyof ConsultationFormValues; label: string }>,
    []
  );

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isOpen: true });
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setSavedConsultationId(null);
  };

  const validate = (formValues: ConsultationFormValues) => {
    const nextErrors: Partial<Record<keyof ConsultationFormValues, string>> = {};

    requiredFields.forEach((field) => {
      const value = formValues[field.name];
      if (typeof value === 'string' && value.trim() === '') {
        nextErrors[field.name] = `${field.label}은(는) 필수 입력 항목입니다.`;
      }
    });

    if (formValues.inquiry_text.trim() && formValues.inquiry_text.trim().length < 10) {
      nextErrors.inquiry_text = '문의내용은 최소 10자 이상 입력해주세요.';
    }

    if (formValues.action_taken.trim() && formValues.action_taken.trim().length < 10) {
      nextErrors.action_taken = '조치내용은 최소 10자 이상 입력해주세요.';
    }

    return nextErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ConsultationFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleMetadataChange = (metadata: Record<string, string>) => {
    setValues((prev) => ({ ...prev, metadata_fields: metadata }));
  };

  const buildSummary = (formValues: ConsultationFormValues) => {
    const parts = [formValues.transaction_name]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(' / ');
    const base = parts ? `${parts} - ${formValues.inquiry_text}` : formValues.inquiry_text;
    return base.trim().slice(0, 500);
  };

  const toNullable = (val: string | null | undefined) => {
    if (typeof val !== 'string') return null;
    const trimmed = val.trim();
    return trimmed.length ? trimmed : null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('입력 내용을 확인해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const summary = buildSummary(values);
      const payload = {
        summary,
        inquiry_text: values.inquiry_text.trim(),
        action_taken: values.action_taken.trim(),
        branch_code: values.branch_code.trim(),
        employee_id: values.employee_id.trim(),
        screen_id: toNullable(values.screen_id),
        transaction_name: toNullable(values.transaction_name),
        business_type: toNullable(values.business_type) as ApiBusinessType | null,
        error_code: toNullable(values.error_code),
        metadata_fields:
          values.metadata_fields && Object.keys(values.metadata_fields).length
            ? values.metadata_fields
            : undefined,
      };

      const response = await createConsultation(payload);

      if (!response.data) {
        throw new Error('상담 저장 실패: 응답 데이터 없음');
      }

      setSavedConsultationId(response.data.id);
      showToast('상담 내용이 성공적으로 저장되었습니다.', 'success');
      setTimeout(() => setIsModalOpen(true), 800);
    } catch (error) {
      console.error('Save error:', error);
      const message =
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        '저장 중 오류가 발생했습니다. 다시 시도해주세요.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
      resetForm();
      navigate('/consultations/search');
    }
  };

  const handleManualConfirm = async () => {
    if (!savedConsultationId) {
      showToast('저장된 상담 정보를 찾을 수 없습니다. 다시 저장 후 시도해주세요.', 'error');
      return;
    }
    if (isCreatingManualDraft) return;

    setIsCreatingManualDraft(true);

    try {
      const response = await createManualDraft({
        consultation_id: savedConsultationId,
        enforce_hallucination_check: true,
      });

      if (!response.data) {
        throw new Error('메뉴얼 초안 생성 실패: 응답 데이터 없음');
      }

      const convertedDraft = convertApiResponseToManualDraft(response.data);

      setIsModalOpen(false);
      showToast('메뉴얼 초안 작성 페이지로 이동합니다.', 'success');
      setTimeout(() => {
        navigate(`/manuals/draft/${response.data.id}`, {
          state: { draft: convertedDraft },
        });
      }, 400);
    } catch (error) {
      console.error('Manual draft create error:', error);
      const message =
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        '메뉴얼 초안 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
      showToast(message, 'error');
    } finally {
      setIsCreatingManualDraft(false);
    }
  };

  const handleManualCancel = () => {
    setIsModalOpen(false);
    resetForm();
    showToast('상담 등록이 완료되었습니다.', 'success');
    navigate('/consultations/search');
  };

  const handleAddCodeConfirm = async (label: string, code: string, description: string) => {
    try {
      if (addCodeType === 'BUSINESS_TYPE') {
        await addNewBusinessType(label, code, description);
        setValues((prev) => ({ ...prev, business_type: code as BusinessType }));
        showToast('새 업무구분이 추가되었습니다.', 'success');
      } else {
        await addNewErrorCode(label, code, description);
        setValues((prev) => ({ ...prev, error_code: code }));
        showToast('새 에러코드가 추가되었습니다.', 'success');
      }
      setAddCodeModalOpen(false);
    } catch (error) {
      console.error('Add code error:', error);
      showToast('코드 추가에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const inputClasses = (hasError: boolean) =>
    [
      'min-h-[36px] w-full rounded border px-3 text-[14px] text-gray-900 outline-none transition',
      hasError
        ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-100'
        : 'border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-200',
    ].join(' ');

  return (
    <>
      <div className="max-w-[900px] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-[16px] font-semibold text-gray-900">
              기본 정보
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  요청영업점<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="branch_code"
                  value={values.branch_code}
                  onChange={handleInputChange}
                  placeholder="영업점 입력 (예: BR001)"
                  className={inputClasses(Boolean(errors.branch_code))}
                />
                {errors.branch_code && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.branch_code}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  요청직원<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={values.employee_id}
                  onChange={handleInputChange}
                  placeholder="직원 ID 입력 (예: EMP1234)"
                  className={inputClasses(Boolean(errors.employee_id))}
                />
                {errors.employee_id && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.employee_id}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  화면번호<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="screen_id"
                  value={values.screen_id}
                  onChange={handleInputChange}
                  placeholder="화면번호 입력 (예: SCR0001)"
                  className={inputClasses(Boolean(errors.screen_id))}
                />
                {errors.screen_id && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.screen_id}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  거래명<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="transaction_name"
                  value={values.transaction_name}
                  onChange={handleInputChange}
                  placeholder="거래명 입력"
                  className={inputClasses(Boolean(errors.transaction_name))}
                />
                {errors.transaction_name && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.transaction_name}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  업무구분<span className="text-red-600">*</span>
                </label>
                <TypeAheadSelectBox
                  options={businessTypeOptions}
                  selectedCode={values.business_type}
                  value={
                    businessTypeOptions.find((opt) => opt.code === values.business_type)
                      ?.label || ''
                  }
                  onChange={(code) => {
                    setValues((prev) => ({ ...prev, business_type: code as BusinessType }));
                    if (errors.business_type) {
                      setErrors((prev) => ({ ...prev, business_type: '' }));
                    }
                  }}
                  onAddNew={(searchTerm) => {
                    setAddCodeType('BUSINESS_TYPE');
                    setAddCodeLabel(searchTerm);
                    setAddCodeModalOpen(true);
                  }}
                  placeholder="업무구분을 검색하거나 선택하세요"
                  error={errors.business_type}
                  isLoading={businessTypeLoading}
                  allowCreate={true}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  에러코드<span className="text-red-600">*</span>
                </label>
                <TypeAheadSelectBox
                  options={errorCodeOptions}
                  selectedCode={values.error_code}
                  value={
                    errorCodeOptions.find((opt) => opt.code === values.error_code)?.label || ''
                  }
                  onChange={(code) => {
                    setValues((prev) => ({ ...prev, error_code: code }));
                    if (errors.error_code) {
                      setErrors((prev) => ({ ...prev, error_code: '' }));
                    }
                  }}
                  onAddNew={(searchTerm) => {
                    setAddCodeType('ERROR_CODE');
                    setAddCodeLabel(searchTerm);
                    setAddCodeModalOpen(true);
                  }}
                  placeholder="에러코드를 검색하거나 선택하세요"
                  error={errors.error_code}
                  isLoading={errorCodeLoading}
                  allowCreate={true}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-[16px] font-semibold text-gray-900">
              상담 내용
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  문의내용<span className="text-red-600">*</span>
                </label>
                <textarea
                  name="inquiry_text"
                  value={values.inquiry_text}
                  onChange={handleInputChange}
                  placeholder="고객의 문의 내용을 입력해주세요"
                  className={`${inputClasses(Boolean(errors.inquiry_text))} min-h-[120px] resize-y py-2`}
                />
                {errors.inquiry_text && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.inquiry_text}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[13px] font-semibold text-gray-900">
                  조치내용<span className="text-red-600">*</span>
                </label>
                <textarea
                  name="action_taken"
                  value={values.action_taken}
                  onChange={handleInputChange}
                  placeholder="해결을 위해 취한 조치를 입력해주세요"
                  className={`${inputClasses(Boolean(errors.action_taken))} min-h-[120px] resize-y py-2`}
                />
                {errors.action_taken && (
                  <span className="mt-1 text-[12px] text-red-600">{errors.action_taken}</span>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-[16px] font-semibold text-gray-900">
              추가 정보 (선택)
            </h3>
            <div className="flex flex-col">
              <label className="mb-1 text-[13px] font-semibold text-gray-900">메타데이터</label>
              <MetadataFields value={values.metadata_fields} onChange={handleMetadataChange} />
              <span className="mt-1 text-[12px] text-gray-600">
                추가 정보가 있는 경우 Key/Value 형태로 입력해주세요
              </span>
            </div>
          </section>

          <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[36px] rounded-md border border-[#005BAC] px-4 text-[14px] font-semibold text-[#005BAC] transition hover:bg-[#E8F1FB]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[36px] items-center justify-center rounded-md bg-[#005BAC] px-4 text-[14px] font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : '저장'}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="메뉴얼 생성"
        onConfirm={handleManualConfirm}
        onCancel={handleManualCancel}
        confirmText={
          isCreatingManualDraft ? `생성 중${'.'.repeat(loadingDots)}` : '예, 생성하기'
        }
        cancelText="아니오"
        disableOverlayClose={isCreatingManualDraft}
        disableCancel={isCreatingManualDraft}
        disableConfirm={isCreatingManualDraft}
      >
        상담 내용이 성공적으로 저장되었습니다.
        <br />
        이 상담 내용을 바탕으로 메뉴얼을 생성하시겠습니까?
        <br />
        <span className="text-[12px] text-gray-600">
          생성에는 최대 1분 정도 소요될 수 있습니다. 진행 중일 때는 창을 닫지 말아주세요.
        </span>
      </Modal>

      {toast.isOpen && (
        <Toast
          type={toast.type}
          message={toast.message}
          isOpen={toast.isOpen}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      <AddCodeModal
        isOpen={addCodeModalOpen}
        codeType={addCodeType}
        initialLabel={addCodeLabel}
        onConfirm={handleAddCodeConfirm}
        onCancel={() => setAddCodeModalOpen(false)}
      />
    </>
  );
};

export default ConsultationCreateForm;

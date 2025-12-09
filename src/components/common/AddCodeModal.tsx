import React, { useState } from 'react';
import Modal from './Modal';

export interface AddCodeModalProps {
  isOpen: boolean;
  codeType: 'BUSINESS_TYPE' | 'ERROR_CODE';
  initialLabel: string;
  onConfirm: (label: string, code: string, description: string) => Promise<void>;
  onCancel: () => void;
}

const AddCodeModal: React.FC<AddCodeModalProps> = ({
  isOpen,
  codeType,
  initialLabel,
  onConfirm,
  onCancel,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const codeTypeLabel = codeType === 'BUSINESS_TYPE' ? '업무구분' : '에러코드';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!label.trim()) {
      newErrors.label = `${codeTypeLabel} 이름은 필수입니다.`;
    }

    if (!code.trim()) {
      newErrors.code = `${codeTypeLabel} 코드는 필수입니다.`;
    } else if (!/^[A-Z_]+$/.test(code)) {
      newErrors.code = '코드는 영문 대문자와 언더스코어(_)만 사용할 수 있습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(label.trim(), code.trim(), description.trim());
      // 폼 초기화
      setLabel(initialLabel);
      setCode('');
      setDescription('');
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setLabel(initialLabel);
    setCode('');
    setDescription('');
    setErrors({});
    onCancel();
  };

  const inputClasses = (hasError: boolean) =>
    [
      'min-h-[36px] w-full rounded border px-3 text-[14px] text-gray-900 outline-none transition',
      hasError
        ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-100'
        : 'border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-200',
    ].join(' ');

  return (
    <Modal
      isOpen={isOpen}
      title={`새 ${codeTypeLabel} 추가`}
      onConfirm={handleSubmit}
      onCancel={handleCancel}
      confirmText={isSubmitting ? '저장 중...' : '저장'}
      disableConfirm={isSubmitting}
      disableCancel={isSubmitting}
    >
      <div className="space-y-4">
        {/* 라벨 입력 */}
        <div className="flex flex-col">
          <label className="mb-1 text-[13px] font-semibold text-gray-900">
            {codeTypeLabel} 이름<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (errors.label) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.label;
                  return newErrors;
                });
              }
            }}
            placeholder={`예: 특수여신`}
            className={inputClasses(Boolean(errors.label))}
          />
          {errors.label && (
            <span className="mt-1 text-[12px] text-red-600">{errors.label}</span>
          )}
        </div>

        {/* 코드 입력 */}
        <div className="flex flex-col">
          <label className="mb-1 text-[13px] font-semibold text-gray-900">
            {codeTypeLabel} 코드<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (errors.code) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.code;
                  return newErrors;
                });
              }
            }}
            placeholder="예: SPECIAL_LOAN"
            className={inputClasses(Boolean(errors.code))}
          />
          {errors.code && (
            <span className="mt-1 text-[12px] text-red-600">{errors.code}</span>
          )}
          <span className="mt-1 text-[12px] text-gray-600">
            영문 대문자와 언더스코어(_)만 사용하세요.
          </span>
        </div>

        {/* 설명 입력 */}
        <div className="flex flex-col">
          <label className="mb-1 text-[13px] font-semibold text-gray-900">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`${codeTypeLabel}에 대한 설명을 입력하세요 (선택)`}
            rows={3}
            className={`${inputClasses(false)} resize-none py-2`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddCodeModal;

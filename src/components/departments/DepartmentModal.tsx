import React, { useState, useEffect } from 'react';
import type { DepartmentResponse } from '@/types/users';

interface DepartmentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  department?: DepartmentResponse | null;
  onClose: () => void;
  onSubmit: (data: { department_code: string; department_name: string; is_active: boolean }) => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  department_code?: string;
  department_name?: string;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  mode,
  department,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen && mode === 'edit' && department) {
      setDepartmentCode(department.department_code);
      setDepartmentName(department.department_name);
      setIsActive(department.is_active ?? true);
    } else if (isOpen && mode === 'create') {
      setDepartmentCode('');
      setDepartmentName('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, mode, department]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!departmentCode.trim()) {
      newErrors.department_code = '부서 코드는 필수입니다.';
    } else if (departmentCode.length > 50) {
      newErrors.department_code = '부서 코드는 50자 이하여야 합니다.';
    }

    if (!departmentName.trim()) {
      newErrors.department_name = '부서명은 필수입니다.';
    } else if (departmentName.length > 100) {
      newErrors.department_name = '부서명은 100자 이하여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      department_code: departmentCode.trim(),
      department_name: departmentName.trim(),
      is_active: isActive,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4"
      style={{ zIndex: 1000 }}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? '부서 신규등록' : '부서 수정'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="deptName" className="text-xs font-semibold text-gray-700">
              부서명 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="deptName"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="부서명을 입력하세요"
              className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                errors.department_name
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
              }`}
              disabled={isSubmitting}
            />
            {errors.department_name && (
              <p className="text-xs text-red-600 mt-1">{errors.department_name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="deptCode" className="text-xs font-semibold text-gray-700">
              부서코드 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="deptCode"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              placeholder="부서코드를 입력하세요"
              className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                errors.department_code
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
              }`}
              disabled={isSubmitting || mode === 'edit'}
            />
            {errors.department_code && (
              <p className="text-xs text-red-600 mt-1">{errors.department_code}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">부서코드는 수정할 수 없습니다.</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="isActive" className="text-xs font-semibold text-gray-700">
              활성여부
            </label>
            <select
              id="isActive"
              value={isActive.toString()}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              disabled={isSubmitting}
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition bg-white text-primary-500 border border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;

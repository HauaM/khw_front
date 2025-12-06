import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { ToastType } from '@/components/common/Toast';
import { RegisterFormValues, UserRole } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface RegisterFormProps {
  onShowToast: (message: string, type?: ToastType) => void;
}

const roleDescriptions: Record<UserRole, string> = {
  CONSULTANT: '상담 내역을 등록하고 메뉴얼 초안을 생성할 수 있습니다',
  REVIEWER: '메뉴얼 초안을 검토하고 승인할 수 있습니다',
  ADMIN: '시스템 전체를 관리하고 사용자 권한을 설정할 수 있습니다',
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>({
    employee_id: '',
    name: '',
    department: '',
    role: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const queueTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timeouts.current.push(id);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegisterFormValues, string>> = {};

    if (!values.employee_id.trim()) {
      nextErrors.employee_id = '직번을 입력하세요';
    }
    if (!values.name.trim()) {
      nextErrors.name = '이름을 입력하세요';
    }
    if (!values.department.trim()) {
      nextErrors.department = '부서를 입력하세요';
    }
    if (!values.role) {
      nextErrors.role = '역할을 선택하세요';
    }
    if (!values.password) {
      nextErrors.password = '비밀번호를 입력하세요';
    } else if (values.password.length < 8) {
      nextErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    }
    if (!values.password_confirm) {
      nextErrors.password_confirm = '비밀번호 확인을 입력하세요';
    } else if (values.password !== values.password_confirm) {
      nextErrors.password_confirm = '비밀번호가 일치하지 않습니다';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const employeeId = values.employee_id.trim();
      const name = values.name.trim();
      const department = values.department.trim();
      const role = (values.role as UserRole) || 'CONSULTANT';

      await authApi.signup({
        username: employeeId,
        employee_id: employeeId,
        name,
        department,
        password: values.password,
        role,
      });

      onShowToast('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', 'success');

      queueTimeout(
        () =>
          navigate('/login', {
            replace: true,
            state: { employeeId },
          }),
        800
      );
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error?.response?.data?.detail || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      onShowToast(typeof message === 'string' ? message : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      setIsSubmitting(false);
    }
  };

  const baseInputClass =
    'w-full min-h-[44px] rounded-md border px-3.5 text-[14px] text-gray-900 transition focus:outline-none';

  const errorInputClass = 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100';
  const normalInputClass = 'border-gray-300 focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20';

  const renderError = (message?: string) =>
    message ? <p className="text-[12px] text-red-600 mt-1">{message}</p> : null;

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>직번</span>
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="employee_id"
          value={values.employee_id}
          onChange={(e) => setValues({ ...values, employee_id: e.target.value })}
          placeholder="직번을 입력하세요"
          className={`${baseInputClass} ${errors.employee_id ? errorInputClass : normalInputClass}`}
        />
        <p className="text-[12px] text-gray-600">예: EMP1234</p>
        {renderError(errors.employee_id)}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>이름</span>
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="이름을 입력하세요"
          className={`${baseInputClass} ${errors.name ? errorInputClass : normalInputClass}`}
        />
        {renderError(errors.name)}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>부서</span>
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="department"
          value={values.department}
          onChange={(e) => setValues({ ...values, department: e.target.value })}
          placeholder="부서명을 입력하세요"
          className={`${baseInputClass} ${errors.department ? errorInputClass : normalInputClass}`}
        />
        <p className="text-[12px] text-gray-600">예: 디지털전략부</p>
        {renderError(errors.department)}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>역할</span>
          <span className="text-red-600">*</span>
        </label>
        <select
          name="role"
          value={values.role}
          onChange={(e) => setValues({ ...values, role: e.target.value as UserRole | '' })}
          className={`${baseInputClass} ${errors.role ? errorInputClass : normalInputClass}`}
        >
          <option value="">역할을 선택하세요</option>
          <option value="CONSULTANT">상담사</option>
          <option value="REVIEWER">검토자</option>
          <option value="ADMIN">관리자</option>
        </select>
        {values.role && <p className="text-[12px] text-gray-600">{roleDescriptions[values.role as UserRole]}</p>}
        {renderError(errors.role)}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>비밀번호</span>
          <span className="text-red-600">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          placeholder="비밀번호를 입력하세요"
          className={`${baseInputClass} ${errors.password ? errorInputClass : normalInputClass}`}
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-[12px] text-gray-600">최소 8자 이상 입력하세요</p>
        {renderError(errors.password)}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-900 inline-flex items-center gap-1">
          <span>비밀번호 확인</span>
          <span className="text-red-600">*</span>
        </label>
        <input
          type="password"
          name="password_confirm"
          value={values.password_confirm}
          onChange={(e) => setValues({ ...values, password_confirm: e.target.value })}
          placeholder="비밀번호를 다시 입력하세요"
          className={`${baseInputClass} ${errors.password_confirm ? errorInputClass : normalInputClass}`}
          minLength={8}
          autoComplete="new-password"
        />
        {renderError(errors.password_confirm)}
      </div>

      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#005BAC] px-4 text-[15px] font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="text-white" />
              <span>가입 중...</span>
            </>
          ) : (
            <span>가입하기</span>
          )}
        </button>

        <div className="text-center text-sm">
          <Link to="/login" className="text-[#005BAC] font-semibold hover:underline">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;

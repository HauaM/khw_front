import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { ToastType } from '@/components/common/Toast';
import { AuthUser, LoginFormValues } from '@/types/auth';
import { authApi, setAuthToken } from '@/lib/api/auth';

interface LoginFormProps {
  initialEmployeeId?: string;
  onShowToast: (message: string, type?: ToastType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ initialEmployeeId = '', onShowToast }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>({
    employee_id: initialEmployeeId,
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    setValues((prev) => ({ ...prev, employee_id: initialEmployeeId }));
  }, [initialEmployeeId]);

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
    const nextErrors: Partial<Record<keyof LoginFormValues, string>> = {};

    if (!values.employee_id.trim()) {
      nextErrors.employee_id = '직번을 입력하세요';
    }

    if (!values.password) {
      nextErrors.password = '비밀번호를 입력하세요';
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
      const password = values.password;

      const tokenResponse = await authApi.login({ username: employeeId, password });
      setAuthToken(tokenResponse.access_token);

      const me = await authApi.me();
      const user: AuthUser = {
        employee_id: me.employee_id,
        name: me.name,
        department: me.department,
        role: me.role,
      };

      localStorage.setItem('user_info', JSON.stringify(user));
      onShowToast('로그인 성공! 대시보드로 이동합니다.', 'success');

      queueTimeout(() => navigate('/', { replace: true }), 800);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.detail || '직번 또는 비밀번호가 올바르지 않습니다.';
      onShowToast(typeof message === 'string' ? message : '직번 또는 비밀번호가 올바르지 않습니다.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleSSOLogin = () => {
    onShowToast('SSO 인증 페이지로 이동합니다...', 'success');
    queueTimeout(() => {
      // TODO: Replace with real SSO redirect when backend is ready
      // window.location.href = '/api/auth/sso';
      console.log('Redirect to SSO provider');
    }, 1000);
  };

  const baseInputClass =
    'w-full min-h-[44px] rounded-md border px-3.5 text-[14px] text-gray-900 transition focus:outline-none';

  const errorInputClass = 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100';
  const normalInputClass = 'border-gray-300 focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20';

  const renderError = (message?: string) =>
    message ? <p className="text-[12px] text-red-600 mt-1">{message}</p> : null;

  return (
    <div className="space-y-6">
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
            autoComplete="username"
          />
          {renderError(errors.employee_id)}
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
            autoComplete="current-password"
          />
          {renderError(errors.password)}
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#005BAC] px-4 text-[15px] font-semibold text-white transition hover:bg-[#00437F] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="text-white" />
                <span>로그인 중...</span>
              </>
            ) : (
              <span>로그인</span>
            )}
          </button>

          <Link
            to="/register"
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#005BAC] bg-white px-4 text-[15px] font-semibold text-[#005BAC] transition hover:bg-[#E8F1FB]"
          >
            회원가입
          </Link>
        </div>
      </form>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span className="h-px flex-1 bg-gray-200" aria-hidden />
        <span>또는</span>
        <span className="h-px flex-1 bg-gray-200" aria-hidden />
      </div>

      <button
        type="button"
        onClick={handleSSOLogin}
        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <svg
          className="h-5 w-5 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        SSO 로그인
      </button>
    </div>
  );
};

export default LoginForm;

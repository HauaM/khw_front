import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import Toast, { useToast } from '@/components/common/Toast';
import useAuthRedirectIfLoggedIn from '@/hooks/useAuthRedirectIfLoggedIn';

const LoginPage: React.FC = () => {
  useAuthRedirectIfLoggedIn();

  const location = useLocation();
  const prefillEmployeeId = (location.state as { employeeId?: string } | undefined)?.employeeId ?? '';
  const { toasts, showToast, removeToast } = useToast();

  return (
    <>
      <div className="space-y-8">
        <AuthHeader title="KWH 지식관리시스템" subtitle="광주은행 헬프데스크 위키" />
        <LoginForm initialEmployeeId={prefillEmployeeId} onShowToast={showToast} />
      </div>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  );
};

const AuthHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center space-y-4">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary-500 text-2xl font-bold text-white">
      KJB
    </div>
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-primary-500">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  </div>
);

export default LoginPage;

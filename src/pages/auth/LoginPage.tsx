import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useToast } from '@/contexts/ToastContext';
import useAuthRedirectIfLoggedIn from '@/hooks/useAuthRedirectIfLoggedIn';

const LoginPage: React.FC = () => {
  useAuthRedirectIfLoggedIn();

  const location = useLocation();
  const prefillEmployeeId = (location.state as { employeeId?: string } | undefined)?.employeeId ?? '';
  const { showToast } = useToast();

  return (
    <div className="space-y-8">
      <AuthHeader title="KWH 지식관리시스템" subtitle="광주은행 헬프데스크 위키" />
      <LoginForm initialEmployeeId={prefillEmployeeId} onShowToast={showToast} />
    </div>
  );
};

const AuthHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center space-y-4">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary-500 text-2xl font-bold text-white">
      KJB
    </div>
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-primary-500">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  </div>
);

export default LoginPage;

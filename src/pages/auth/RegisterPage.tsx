import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { useToast } from '@/contexts/ToastContext';
import useAuthRedirectIfLoggedIn from '@/hooks/useAuthRedirectIfLoggedIn';

const RegisterPage: React.FC = () => {
  useAuthRedirectIfLoggedIn();
  const { showToast } = useToast();

  return (
    <div className="space-y-8">
      <AuthHeader title="회원가입" subtitle="KWH 시스템 계정을 생성합니다" />
      <RegisterForm onShowToast={showToast} />
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

export default RegisterPage;

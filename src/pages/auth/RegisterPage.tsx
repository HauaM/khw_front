import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import Toast, { useToast } from '@/components/common/Toast';
import useAuthRedirectIfLoggedIn from '@/hooks/useAuthRedirectIfLoggedIn';

const RegisterPage: React.FC = () => {
  useAuthRedirectIfLoggedIn();
  const { toasts, showToast, removeToast } = useToast();

  return (
    <>
      <div className="space-y-8">
        <AuthHeader title="회원가입" subtitle="KWH 시스템 계정을 생성합니다" />
        <RegisterForm onShowToast={showToast} />
      </div>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  );
};

const AuthHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center space-y-4">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#005BAC] text-2xl font-bold text-white">
      KJB
    </div>
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-[#005BAC]">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  </div>
);

export default RegisterPage;

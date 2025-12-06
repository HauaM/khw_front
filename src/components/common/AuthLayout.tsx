import React from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#005BAC] to-[#1A73E8] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-xl shadow-xl px-10 py-12">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

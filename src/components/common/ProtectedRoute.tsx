import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthUser from '@/hooks/useAuthUser';

/**
 * ProtectedRoute 컴포넌트
 *
 * 로그인하지 않은 사용자가 접근할 수 없는 경로를 보호합니다.
 * 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트됩니다.
 */
const ProtectedRoute: React.FC = () => {
  const { user } = useAuthUser();

  // accessToken 확인 (user_info만으로는 불충분)
  const accessToken = localStorage.getItem('accessToken');

  // 로그인하지 않은 경우 (user 정보 또는 토큰이 없는 경우) 로그인 페이지로 리다이렉트
  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 로그인한 경우 하위 라우트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
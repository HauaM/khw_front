import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children?: ReactNode;
  user?: {
    name: string;
    department: string;
    role: string;
  };
  onLogout?: () => void;
}

const defaultUser = {
  name: '김광주',
  department: 'IT운영부',
  role: '관리자',
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, user = defaultUser, onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    console.log('로그아웃');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <div className="h-screen flex flex-col">
      <AppHeader user={user} onLogout={handleLogout} />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children ? children : <Outlet />}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

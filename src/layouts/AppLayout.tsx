import React, { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import useAuthUser from '@/hooks/useAuthUser';
import { clearAuthToken, getRoleLabel } from '@/lib/api/auth';

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

const AppLayout: React.FC<AppLayoutProps> = ({ children, user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const resolvedUser = propUser
    ? { ...propUser, role: propUser.role }
    : user
    ? { ...user, role: getRoleLabel(user.role) }
    : defaultUser;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    clearAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col">
      <AppHeader user={resolvedUser} onLogout={handleLogout} />

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

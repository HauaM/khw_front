import React from 'react';

interface AppHeaderProps {
  systemName?: string;
  subtitle?: string;
  user?: {
    name: string;
    department: string;
    role: string;
  };
  onLogout?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  systemName = 'KWH 지식관리시스템',
  subtitle = '광주은행 헬프데스크 위키',
  user,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      <div className="flex flex-col leading-tight">
        <h1 className="text-lg font-bold text-primary-700">{systemName}</h1>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        {user ? (
          <>
            <span className="text-gray-700">{user.department}</span>
            <span className="text-gray-400">·</span>
            <span className="font-semibold text-gray-900">{user.name}</span>
            <span className="text-gray-400">·</span>
            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
              {user.role}
            </span>
            <button
              onClick={onLogout}
              className="ml-1 px-3 py-1.5 text-sm font-semibold text-primary-700 border border-primary-700 rounded-md hover:bg-primary-50 transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

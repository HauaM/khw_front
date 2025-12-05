import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="mt-1 text-sm text-gray-500">
          KWH 지식관리시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 상담 건수</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-success">
            <span className="font-medium">+12%</span> 전월 대비
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">메뉴얼 수</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">567</p>
            </div>
            <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-success">
            <span className="font-medium">+8</span> 신규 등록
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">승인 대기</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">23</p>
            </div>
            <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-warning">
            <span className="font-medium">처리 필요</span>
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">89</p>
            </div>
            <div className="w-12 h-12 bg-info-light rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            <span className="font-medium">현재 접속 중</span>
          </p>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 상담</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">인터넷뱅킹 로그인 오류</p>
                  <p className="text-xs text-gray-500 mt-1">IT운영부 · 김광주 · 2시간 전</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-warning-light text-warning-dark rounded">
                  처리중
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 메뉴얼</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">계좌 이체 절차 가이드</p>
                  <p className="text-xs text-gray-500 mt-1">업무시스템 · 1일 전</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-success-light text-success-dark rounded">
                  승인완료
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

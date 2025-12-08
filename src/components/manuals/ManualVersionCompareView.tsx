import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ManualVersionInfo,
  ManualVersionDetail,
  ManualGuideline,
  ChangeFlag,
} from '@/types/manuals';
import { formatDate } from '@/lib/utils/dateFormatter';

interface ManualVersionCompareViewProps {
  manualId: string;
  versions: ManualVersionInfo[];
  oldVersion: string;
  newVersion: string;
  oldData: ManualVersionDetail | null;
  newData: ManualVersionDetail | null;
  isLoading: boolean;
  setOldVersion: (version: string) => void;
  setNewVersion: (version: string) => void;
  getKeywordStatus: (keyword: string, side: 'old' | 'new') => ChangeFlag;
  getGuidelineStatus: (guideline: ManualGuideline, side: 'old' | 'new') => ChangeFlag;
}

/**
 * 메뉴얼 버전 비교 컴포넌트
 * 두 버전의 메뉴얼을 좌우로 비교하여 표시합니다
 */
const ManualVersionCompareView: React.FC<ManualVersionCompareViewProps> = ({
  manualId,
  versions,
  oldVersion,
  newVersion,
  oldData,
  newData,
  isLoading,
  setOldVersion,
  setNewVersion,
  getKeywordStatus,
  getGuidelineStatus,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/manuals/${manualId}`);
  };

  const getKeywordClass = (status: ChangeFlag): string => {
    switch (status) {
      case 'ADDED':
        return 'bg-green-100 text-green-800';
      case 'REMOVED':
        return 'bg-red-100 text-red-800 line-through opacity-70';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getGuidelineClass = (status: ChangeFlag): string => {
    switch (status) {
      case 'ADDED':
        return 'bg-green-50 border-l-4 border-green-600';
      case 'REMOVED':
        return 'bg-red-50 border-l-4 border-red-600 opacity-70';
      case 'MODIFIED':
        return 'bg-orange-50 border-l-4 border-orange-500';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    if (status === 'APPROVED') {
      return 'bg-green-50 text-green-700';
    }
    return 'bg-red-50 text-red-700';
  };

  const getStatusBadgeText = (status: string): string => {
    return status === 'APPROVED' ? '승인됨' : '사용 중단';
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 w-full">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              메뉴얼
            </button>
            <span>&gt;</span>
            <span>버전 비교</span>
          </nav>

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">버전 비교</h2>
          <p className="text-sm text-gray-600">두 버전의 메뉴얼 내용을 비교합니다</p>
        </div>

        {/* 우측 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-gray-400 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            돌아가기
          </button>
        </div>
      </div>

      {/* 버전 선택 카드 */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 이전 버전 선택 */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg
                className="w-4 h-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              이전 버전
            </label>
            <select
              value={oldVersion}
              onChange={(e) => setOldVersion(e.target.value)}
              className="min-h-11 border-2 border-orange-500 rounded-md px-3 text-sm font-semibold text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {versions.map((v) => (
                <option key={`old-${v.value}`} value={v.value} disabled={v.value === newVersion}>
                  {v.label} ({v.date})
                </option>
              ))}
            </select>
          </div>

          {/* 최신 버전 선택 */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg
                className="w-4 h-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              최신 버전
            </label>
            <select
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              className="min-h-11 border-2 border-green-700 rounded-md px-3 text-sm font-semibold text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              {versions.map((v) => (
                <option key={`new-${v.value}`} value={v.value} disabled={v.value === oldVersion}>
                  {v.label} ({v.date})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-white rounded-lg shadow-sm px-5 py-4 mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-3">변경사항 표시</h4>
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100"></div>
            <span className="text-sm text-gray-700">추가됨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100"></div>
            <span className="text-sm text-gray-700">삭제됨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100"></div>
            <span className="text-sm text-gray-700">수정됨</span>
          </div>
        </div>
      </div>

      {/* 비교 그리드 */}
      {!isLoading && oldData && newData ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
          {/* ===== 이전 버전 컬럼 ===== */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 헤더 */}
            <div className="px-5 py-4 flex items-center justify-between border-b-2 border-orange-500 bg-orange-50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold">
                  이전
                </span>
              </h3>
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                {oldData.version}
              </span>
            </div>

            {/* 본문 */}
            <div className="p-5 space-y-6">
              {/* 주제 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">주제</h4>
                <p className="text-base font-bold text-gray-900 leading-6">{oldData.topic}</p>
              </div>

              {/* 키워드 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {oldData.keywords.map((keyword, idx) => (
                    <span
                      key={`old-keyword-${keyword}-${idx}`}
                      className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${getKeywordClass(
                        getKeywordStatus(keyword, 'old'),
                      )}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* 배경 정보 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">배경 정보</h4>
                <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">{oldData.background}</p>
              </div>

              {/* 조치사항 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                  조치사항 ({oldData.guidelines.length}개)
                </h4>
                <ul className="space-y-2">
                  {oldData.guidelines.map((guideline, idx) => {
                    const status = getGuidelineStatus(guideline, 'old');
                    return (
                      <li
                        key={`old-guideline-${guideline.title}-${idx}`}
                        className={`flex gap-3 p-3 rounded-md ${getGuidelineClass(status)}`}
                      >
                        <div className="flex items-center justify-center min-w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">
                            {guideline.title}
                          </h5>
                          <p className="text-xs text-gray-700 leading-5">
                            {guideline.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 상태 및 날짜 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">상태 및 정보</h4>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                      oldData.status,
                    )}`}
                  >
                    {getStatusBadgeText(oldData.status)}
                  </span>
                  <span className="text-xs text-gray-600">{formatDate(oldData.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 최신 버전 컬럼 ===== */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 헤더 */}
            <div className="px-5 py-4 flex items-center justify-between border-b-2 border-green-700 bg-green-50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-700 text-white text-xs font-semibold">
                  최신
                </span>
              </h3>
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                {newData.version}
              </span>
            </div>

            {/* 본문 */}
            <div className="p-5 space-y-6">
              {/* 주제 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">주제</h4>
                <p className="text-base font-bold text-gray-900 leading-6">{newData.topic}</p>
              </div>

              {/* 키워드 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {newData.keywords.map((keyword, idx) => (
                    <span
                      key={`new-keyword-${keyword}-${idx}`}
                      className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${getKeywordClass(
                        getKeywordStatus(keyword, 'new'),
                      )}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* 배경 정보 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">배경 정보</h4>
                <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">{newData.background}</p>
              </div>

              {/* 조치사항 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                  조치사항 ({newData.guidelines.length}개)
                </h4>
                <ul className="space-y-2">
                  {newData.guidelines.map((guideline, idx) => {
                    const status = getGuidelineStatus(guideline, 'new');
                    return (
                      <li
                        key={`new-guideline-${guideline.title}-${idx}`}
                        className={`flex gap-3 p-3 rounded-md ${getGuidelineClass(status)}`}
                      >
                        <div className="flex items-center justify-center min-w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">
                            {guideline.title}
                          </h5>
                          <p className="text-xs text-gray-700 leading-5">
                            {guideline.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 상태 및 날짜 */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">상태 및 정보</h4>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                      newData.status,
                    )}`}
                  >
                    {getStatusBadgeText(newData.status)}
                  </span>
                  <span className="text-xs text-gray-600">{formatDate(newData.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !isLoading ? (
        /* 데이터 없음 상태 */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            버전 데이터를 불러올 수 없음
          </h4>
          <p className="text-sm text-gray-600">선택한 버전의 데이터를 확인해주세요</p>
        </div>
      ) : (
        /* 로딩 상태 */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">버전 데이터를 불러오는 중입니다...</p>
        </div>
      )}
    </main>
  );
};

export default ManualVersionCompareView;

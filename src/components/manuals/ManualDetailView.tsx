import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManualDetail, ManualGuideline } from '@/types/manuals';
import { useToast } from '@/contexts/ToastContext';

interface ManualDetailViewProps {
  detail: ManualDetail;
}

/**
 * 날짜 포맷 유틸: ISO datetime을 "YYYY-MM-DD HH:mm" 형식으로 변환
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 가이드라인 문자열을 파싱하여 배열로 변환
 * 개행으로 구분된 텍스트를 제목-설명 쌍으로 파싱
 */
const parseGuidelines = (guidelineStr: string): ManualGuideline[] => {
  const lines = guidelineStr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const guidelines: ManualGuideline[] = [];

  // 각 라인을 제목으로 처리하고, 다음 라인을 설명으로 처리하는 방식으로 파싱
  // 더 구조화된 형식이 필요하면 백엔드에서 JSON 배열로 제공받도록 수정
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      guidelines.push({
        title: lines[i],
        description: lines[i + 1],
      });
    } else {
      // 마지막 라인이 홀수개면, 제목만 있는 경우
      guidelines.push({
        title: lines[i],
        description: '',
      });
    }
  }

  return guidelines;
};

/**
 * 메뉴얼 상세 조회 화면
 */
const ManualDetailView: React.FC<ManualDetailViewProps> = ({ detail }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 가이드라인 파싱 (메모이제이션)
  const guidelines = useMemo(() => parseGuidelines(detail.guideline), [detail.guideline]);

  // 핸들러
  const handleBackToList = () => {
    navigate('/manuals/search');
  };

  const handleEdit = () => {
    // TODO: 실제 편집 페이지 라우트로 이동
    navigate(`/manuals/${detail.id}/edit`);
  };

  const handleVersionCompare = () => {
    navigate(`/manuals/${detail.id}/versions/compare`);
  };

  // 상태 배지 텍스트
  const statusText = detail.status === 'APPROVED' ? '승인됨' : '사용 중단';
  const isDeprecated = detail.status === 'DEPRECATED';

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-start gap-6">
        {/* 좌측: 제목 및 메타정보 */}
        <div className="flex-1">
          {/* 브레드크럼 */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={handleBackToList}
              className="text-blue-700 hover:text-blue-900 underline cursor-pointer transition-colors"
            >
              메뉴얼 관리
            </button>
            <span className="text-gray-400">›</span>
            <span>메뉴얼 상세</span>
          </nav>

          {/* 제목 */}
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900">{detail.topic}</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold font-mono">
              {detail.id}
            </span>
          </div>

          {/* 메타정보 */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
            {/* 상태 */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  isDeprecated
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {statusText}
              </span>
            </div>

            {/* 업무 구분 */}
            {detail.business_type && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span>{detail.business_type}</span>
              </div>
            )}

            {/* 에러 코드 */}
            {detail.error_code && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="font-mono">{detail.error_code}</span>
              </div>
            )}

            {/* 수정일 */}
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>수정일: {formatDate(detail.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleVersionCompare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-400 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            버전 비교
          </button>

          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-700 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            수정하기
          </button>
        </div>
      </div>

      {/* 경고 박스 (Deprecated인 경우에만) */}
      {isDeprecated && (
        <div className="flex items-start gap-3 p-4 rounded-md bg-red-50 border-l-4 border-red-700">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 mb-1">⚠️ 이 메뉴얼은 사용 중단되었습니다</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              이 문서는 더 이상 유효하지 않으며 참고용으로만 보관되고 있습니다. 최신 메뉴얼을
              확인하시거나 담당자에게 문의하시기 바랍니다.
            </p>
          </div>
        </div>
      )}

      {/* 콘텐츠 카드 */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        {/* 섹션 1: 키워드 */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-300 mb-4">
            <svg
              className="w-5 h-5 text-blue-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <h3 className="text-base font-bold text-gray-900">키워드</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 섹션 2: 배경 정보 */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-300 mb-4">
            <svg
              className="w-5 h-5 text-blue-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 className="text-base font-bold text-gray-900">배경 정보</h3>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {detail.background}
          </p>
        </div>

        {/* 섹션 3: 조치사항 */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-300 mb-4">
            <svg
              className="w-5 h-5 text-blue-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h3 className="text-base font-bold text-gray-900">조치사항</h3>
          </div>
          <ul className="space-y-3">
            {guidelines.map((guideline, index) => (
              <li
                key={index}
                className="flex gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {guideline.title}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {guideline.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManualDetailView;

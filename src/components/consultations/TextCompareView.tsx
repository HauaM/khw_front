import React from 'react';

interface TextCompareViewProps {
  leftText: string;
  rightText: string;
  leftLabel?: string;
  rightLabel?: string;
}

/**
 * 텍스트 비교 뷰 컴포넌트
 *
 * - 좌우 2열로 텍스트를 표시
 * - 좌: 관련 메뉴얼(기존 데이터)
 * - 우: 현재 입력 중인 데이터
 * - 간단한 diff 하이라이팅 적용 (문장 단위)
 */
const TextCompareView: React.FC<TextCompareViewProps> = ({
  leftText,
  rightText,
  leftLabel = '관련 메뉴얼',
  rightLabel = '현재 입력',
}) => {
  // 간단한 문장 단위 비교 (줄바꿈 기준)
  const leftLines = leftText.split('\n').filter((line) => line.trim());
  const rightLines = rightText.split('\n').filter((line) => line.trim());

  const isLineDifferent = (left: string, right: string) => {
    return left.trim() !== right.trim();
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 왼쪽: 관련 메뉴얼 데이터 */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-gray-700">{leftLabel}</h5>
        <div className="min-h-24 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900">
          {leftLines.length > 0 ? (
            leftLines.map((line, idx) => {
              const isDifferent =
                idx >= rightLines.length || isLineDifferent(line, rightLines[idx]);
              return (
                <div
                  key={idx}
                  className={
                    isDifferent
                      ? 'mb-1 rounded bg-red-50 px-1 py-0.5 text-gray-900'
                      : 'mb-1 text-gray-900'
                  }
                >
                  {line}
                </div>
              );
            })
          ) : (
            <span className="text-gray-400">데이터 없음</span>
          )}
        </div>
      </div>

      {/* 오른쪽: 현재 입력 중인 데이터 */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-gray-700">{rightLabel}</h5>
        <div className="min-h-24 rounded-md border border-primary-500 bg-blue-50 p-3 text-sm text-gray-900">
          {rightLines.length > 0 ? (
            rightLines.map((line, idx) => {
              const isDifferent =
                idx >= leftLines.length || isLineDifferent(line, leftLines[idx]);
              return (
                <div
                  key={idx}
                  className={
                    isDifferent
                      ? 'mb-1 rounded bg-blue-100 px-1 py-0.5 text-gray-900'
                      : 'mb-1 text-gray-900'
                  }
                >
                  {line}
                </div>
              );
            })
          ) : (
            <span className="text-gray-400">입력 대기 중</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextCompareView;

// Scroll to Row Hook (Reusable)
import { useRef, useCallback } from 'react';

export interface UseScrollToRowOptions {
  /**
   * 하이라이트 지속 시간 (밀리초)
   * @default 3000
   */
  highlightDuration?: number;

  /**
   * 스크롤 동작
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * 스크롤 위치 (block)
   * @default 'center'
   */
  scrollBlock?: ScrollLogicalPosition;

  /**
   * Toast 메시지 콜백
   */
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const useScrollToRow = (options: UseScrollToRowOptions = {}) => {
  const {
    highlightDuration = 3000,
    scrollBehavior = 'smooth',
    scrollBlock = 'center',
    onToast,
  } = options;

  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const highlightedIdRef = useRef<string | null>(null);

  /**
   * 특정 ID의 row로 스크롤하고 하이라이트 적용
   * @param targetId - 스크롤할 대상 ID
   * @param rowRefs - row ref 객체
   * @param availableIds - 현재 사용 가능한 ID 목록 (에러 안내용)
   */
  const scrollToRow = useCallback(
    (
      targetId: string,
      rowRefs: React.MutableRefObject<Record<string, HTMLElement | null>>,
      availableIds: string[] = []
    ): string | null => {
      // 빈 값 체크
      if (!targetId || targetId.trim() === '') {
        if (onToast) {
          onToast('Manual ID를 입력해주세요.', 'error');
        }
        return null;
      }

      const targetRef = rowRefs.current[targetId];

      // 대상을 찾은 경우
      if (targetRef) {
        // 이전 타이머 취소
        if (highlightTimerRef.current) {
          clearTimeout(highlightTimerRef.current);
        }

        // 하이라이트 설정
        highlightedIdRef.current = targetId;

        // 스크롤
        requestAnimationFrame(() => {
          targetRef.scrollIntoView({
            behavior: scrollBehavior,
            block: scrollBlock,
          });
        });

        // 하이라이트 자동 해제
        highlightTimerRef.current = setTimeout(() => {
          highlightedIdRef.current = null;
        }, highlightDuration);

        return targetId;
      }

      // 대상을 찾지 못한 경우
      if (onToast) {
        const exampleIds = availableIds.slice(0, 5).join(', ');
        const message = availableIds.length > 0
          ? `해당 Manual ID를 찾을 수 없습니다. 예) ${exampleIds}`
          : '해당 Manual ID를 찾을 수 없습니다.';
        onToast(message, 'error');
      }

      return null;
    },
    [highlightDuration, scrollBehavior, scrollBlock, onToast]
  );

  /**
   * 현재 하이라이트된 ID 확인
   */
  const isHighlighted = useCallback((id: string): boolean => {
    return highlightedIdRef.current === id;
  }, []);

  /**
   * 하이라이트 수동 해제
   */
  const clearHighlight = useCallback(() => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    highlightedIdRef.current = null;
  }, []);

  return {
    scrollToRow,
    isHighlighted,
    clearHighlight,
    highlightedIdRef,
  };
};

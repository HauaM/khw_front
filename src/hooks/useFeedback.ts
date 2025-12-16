/**
 * useFeedback 훅
 *
 * API 응답의 피드백(feedback) 배열을 처리하여 사용자에게 표시합니다.
 * 각 피드백의 레벨(info, warning, error)에 따라 다른 토스트 알림을 표시합니다.
 */

import { useCallback } from 'react';
import { ApiFeedback } from '@/types/api';
import { useToast } from './useToast';

interface UseFeedbackOptions {
  /** 자동으로 피드백을 표시할지 여부 (기본값: true) */
  autoShow?: boolean;
  /** 각 레벨별 지속 시간 (밀리초) */
  duration?: {
    info?: number;
    warning?: number;
    error?: number;
  };
}

export function useFeedback(options: UseFeedbackOptions = {}) {
  const { autoShow = true } = options;
  const toast = useToast();

  /**
   * 단일 피드백 메시지를 토스트로 표시
   */
  const showFeedback = useCallback(
    (feedback: ApiFeedback) => {
      const defaultDurations = {
        info: 3000,
        warning: 4000,
        error: 5000,
      };

      const duration = options.duration?.[feedback.level] ?? defaultDurations[feedback.level];

      switch (feedback.level) {
        case 'info':
          toast.info(feedback.message, duration);
          break;
        case 'warning':
          toast.warning(feedback.message, duration);
          break;
        case 'error':
          toast.error(feedback.message, duration);
          break;
      }
    },
    [toast, options.duration]
  );

  /**
   * 피드백 배열을 순차적으로 표시
   *
   * 예: 피드백이 여러 개인 경우 각각을 순차적으로 표시
   */
  const showFeedbacks = useCallback(
    (feedbacks: ApiFeedback[], delay?: number) => {
      feedbacks.forEach((feedback, index) => {
        setTimeout(() => {
          showFeedback(feedback);
        }, delay ? delay * index : 0);
      });
    },
    [showFeedback]
  );

  /**
   * 특정 레벨의 피드백만 필터링하여 표시
   */
  const showFeedbacksByLevel = useCallback(
    (feedbacks: ApiFeedback[], level: ApiFeedback['level']) => {
      const filtered = feedbacks.filter((f) => f.level === level);
      showFeedbacks(filtered);
    },
    [showFeedbacks]
  );

  /**
   * 에러 레벨 피드백만 표시
   */
  const showErrors = useCallback(
    (feedbacks: ApiFeedback[]) => {
      showFeedbacksByLevel(feedbacks, 'error');
    },
    [showFeedbacksByLevel]
  );

  /**
   * 경고 레벨 피드백만 표시
   */
  const showWarnings = useCallback(
    (feedbacks: ApiFeedback[]) => {
      showFeedbacksByLevel(feedbacks, 'warning');
    },
    [showFeedbacksByLevel]
  );

  /**
   * 정보 레벨 피드백만 표시
   */
  const showInfos = useCallback(
    (feedbacks: ApiFeedback[]) => {
      showFeedbacksByLevel(feedbacks, 'info');
    },
    [showFeedbacksByLevel]
  );

  return {
    showFeedback,
    showFeedbacks,
    showFeedbacksByLevel,
    showErrors,
    showWarnings,
    showInfos,
    autoShow,
  };
}

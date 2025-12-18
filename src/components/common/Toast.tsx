import React, { useEffect, useState } from 'react';
import { ToastContext, ToastMessage, ToastContent } from '@/contexts/ToastContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  type: ToastType;
  message: string;
  isOpen: boolean;
}

/**
 * 개별 Toast 컴포넌트
 * props로 받는 방식과 Context 방식 모두 지원
 */
interface SingleToastProps {
  toast?: ToastMessage;
  message?: string;
  type?: ToastType;
  isOpen?: boolean;
  onClose?: () => void;
}

const SingleToast: React.FC<SingleToastProps> = ({
  toast,
  message,
  type = 'success',
  isOpen = true,
  onClose,
}) => {
  const [visible, setVisible] = useState(isOpen);
  const context = React.useContext(ToastContext);

  const displayMessage = toast?.message || message || '';
  const displayType = (toast?.type || type) as ToastType;

  const displayCode = toast?.code;

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return undefined;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setVisible(false);
      onClose?.();
      if (toast) {
        context?.removeToast(toast.id);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose, visible, toast, context]);

  if (!visible) return null;

  const typeConfig = {
    success: { border: 'border-l-green-600', text: 'text-green-600', icon: 'checkmark' },
    error: { border: 'border-l-red-600', text: 'text-red-600', icon: 'error' },
    info: { border: 'border-l-blue-600', text: 'text-blue-600', icon: 'info' },
    warning: { border: 'border-l-amber-600', text: 'text-amber-600', icon: 'warning' },
  };

  const config = typeConfig[displayType];

  return (
    <div
      className={`fixed right-6 top-20 z-50 flex min-w-[320px] items-center gap-3 rounded-md border-l-4 bg-white px-4 py-3 shadow-lg transition ${config.border}`}
    >
      <span className={`flex h-6 w-6 items-center justify-center flex-shrink-0 ${config.text}`} aria-hidden>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {config.icon === 'checkmark' && (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          )}
          {config.icon === 'error' && (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </>
          )}
          {config.icon === 'info' && (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          )}
          {config.icon === 'warning' && (
            <>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05l-8.47-14.14a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </>
          )}
        </svg>
      </span>
      <div className="flex-1 text-sm text-gray-900">
        {displayCode && <div className="text-xs text-gray-400">{displayCode}</div>}
        <div>{displayMessage}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onClose?.();
          if (toast) {
            context?.removeToast(toast.id);
          }
        }}
        className="text-gray-400 transition hover:text-gray-600"
        aria-label="토스트 닫기"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast 컨테이너 - Context의 toasts를 렌더링합니다.
 */
export const ToastContainer: React.FC = () => {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start gap-2 p-6">
      {context.toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} />
        </div>
      ))}
    </div>
  );
};

/**
 * Context 기반 useToast 훅
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Context가 없으면 더미 구현 반환 (로컬 상태)
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; code?: string }>>([]);

    const showToast = (content: string | ToastContent, type: ToastType = 'success') => {
      const id = Date.now();
      const payload = typeof content === 'string' ? { message: content } : content;
      setToasts((prev) => [...prev, { id, type, ...payload }]);
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    };

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, showToast, removeToast };
  }

  return {
    toasts: context.toasts,
    showToast: context.showToast,
    removeToast: context.removeToast,
  };
};

export default SingleToast;

import React, { createContext, useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastContent {
  message: string;
  code?: string;
}

export interface ToastMessage extends ToastContent {
  id: number;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (content: string | ToastContent, type?: ToastType, duration?: number) => void;
  success: (content: string | ToastContent, duration?: number) => void;
  error: (content: string | ToastContent, duration?: number) => void;
  info: (content: string | ToastContent, duration?: number) => void;
  warning: (content: string | ToastContent, duration?: number) => void;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (content: string | ToastContent, type: ToastType = 'info', duration: number = 3000) => {
      const id = Date.now();
      const payload = typeof content === 'string' ? { message: content } : content;
      setToasts((prev) => [...prev, { id, type, duration, ...payload }]);

      // 지정한 시간 후 자동으로 제거
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (content: string | ToastContent, duration?: number) => {
      showToast(content, 'success', duration ?? 3000);
    },
    [showToast]
  );

  const error = useCallback(
    (content: string | ToastContent, duration?: number) => {
      showToast(content, 'error', duration ?? 5000);
    },
    [showToast]
  );

  const info = useCallback(
    (content: string | ToastContent, duration?: number) => {
      showToast(content, 'info', duration ?? 3000);
    },
    [showToast]
  );

  const warning = useCallback(
    (content: string | ToastContent, duration?: number) => {
      showToast(content, 'warning', duration ?? 4000);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, info, warning, removeToast }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    showToast: context.showToast,
    success: context.success,
    error: context.error,
    info: context.info,
    warning: context.warning,
    removeToast: context.removeToast,
  };
};

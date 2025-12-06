import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastState {
  type: ToastType;
  message: string;
  isOpen: boolean;
}

interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen?: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type = 'success', message, isOpen = true, onClose }) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return undefined;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose, visible]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed right-6 top-20 z-50 flex min-w-[280px] items-center gap-3 rounded-md border border-gray-100 bg-white px-4 py-3 shadow-lg transition">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          isSuccess ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}
        aria-hidden
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isSuccess ? (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </>
          )}
        </svg>
      </span>
      <div className="flex-1 text-[14px] text-gray-900">{message}</div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onClose();
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

export default Toast;

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
};

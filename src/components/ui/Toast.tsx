import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

function ToastItem({ id, message, type, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="pointer-events-auto flex w-full max-w-sm rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5 animate-slide-in-up">
      <div className="flex w-full items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
        <p className="flex-1 text-sm text-gray-700">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex flex-col items-end justify-end px-4 py-6 pointer-events-none sm:p-6 gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}

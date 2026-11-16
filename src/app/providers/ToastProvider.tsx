import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

interface ToastValue {
  show: (message: string, tone?: 'ok' | 'error') => void;
}

const ToastContext = createContext<ToastValue>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error'; id: number } | null>(null);
  const timer = useRef(0);

  const show = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => {
    window.clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && (
          <p key={toast.id} className={`toast toast--${toast.tone}`}>
            <span className="toast__dot" aria-hidden="true" />
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  return useContext(ToastContext);
}

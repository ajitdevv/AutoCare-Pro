"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 200);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />,
            error: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
          };
          const borders = {
            success: "border-green-200 bg-green-50",
            error: "border-red-200 bg-red-50",
            info: "border-blue-200 bg-blue-50",
          };
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${
                borders[toast.type] || borders.info
              } ${toast.exiting ? "toast-exit" : "toast-enter"}`}
            >
              {icons[toast.type] || icons.info}
              <p className="text-sm text-gray-800 flex-1 font-medium">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

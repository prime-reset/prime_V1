"use client";

import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

const TOAST_DURATION = 3200;

export function PrimeToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = TOAST_DURATION }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current,
        { id, type, title, message, duration },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      success: (title, message, options = {}) =>
        showToast({
          type: "success",
          title,
          message,
          ...options,
        }),

      error: (title, message, options = {}) =>
        showToast({
          type: "error",
          title,
          message,
          duration: 4500,
          ...options,
        }),

      info: (title, message, options = {}) =>
        showToast({
          type: "info",
          title,
          message,
          ...options,
        }),

      remove: removeToast,
    }),
    [removeToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="prime-toast-region"
        role="region"
        aria-label="Notifications PRIME"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <PrimeToast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <style jsx global>{`
        .prime-toast-region {
          position: fixed;
          top: max(18px, env(safe-area-inset-top));
          left: 50%;
          z-index: 999999;
          width: min(calc(100% - 28px), 430px);
          display: grid;
          gap: 10px;
          pointer-events: none;
          transform: translateX(-50%);
        }

        .prime-toast {
          position: relative;
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 34px;
          gap: 12px;
          align-items: start;
          padding: 14px;
          overflow: hidden;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          background: rgba(15, 15, 15, 0.97);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(18px);
          pointer-events: auto;
          animation: primeToastIn 260ms ease both;
        }

        .prime-toast::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: 3px;
          background: currentColor;
          opacity: 0.8;
          transform-origin: left;
          animation: primeToastProgress 3200ms linear both;
        }

        .prime-toast-success {
          color: #6be28b;
        }

        .prime-toast-error {
          color: #f05b5b;
        }

        .prime-toast-info {
          color: #d4b06a;
        }

        .prime-toast-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid currentColor;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.035);
        }

        .prime-toast-content {
          min-width: 0;
          padding-top: 2px;
        }

        .prime-toast-title {
          margin: 0;
          color: white;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 950;
        }

        .prime-toast-message {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.62);
          font-size: 12.5px;
          line-height: 1.45;
        }

        .prime-toast-close {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          padding: 0;
          color: rgba(255, 255, 255, 0.48);
          border: none;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
        }

        .prime-toast-close:active {
          transform: scale(0.94);
        }

        @keyframes primeToastIn {
          from {
            opacity: 0;
            transform: translateY(-14px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes primeToastProgress {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .prime-toast,
          .prime-toast::after {
            animation: none;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

function PrimeToast({ toast, onClose }) {
  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
      ? AlertCircle
      : Info;

  return (
    <article
      className={`prime-toast prime-toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="prime-toast-icon">
        <Icon size={21} />
      </div>

      <div className="prime-toast-content">
        <p className="prime-toast-title">{toast.title}</p>

        {toast.message && (
          <p className="prime-toast-message">{toast.message}</p>
        )}
      </div>

      <button
        type="button"
        className="prime-toast-close"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        <X size={17} />
      </button>
    </article>
  );
}

export function usePrimeToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "usePrimeToast doit être utilisé dans PrimeToastProvider."
    );
  }

  return context;
}

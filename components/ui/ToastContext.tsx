"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastItem, ToastType } from "./Toast";
import styles from "./Toast.module.scss";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const error = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );
  const info = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

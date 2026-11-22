import React from "react";
import styles from "./Toast.module.scss";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const type = toast.type || "info";

  const getIcon = () => {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "info":
      default:
        return "info";
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.content}>
        <span className={`material-symbols-outlined ${styles.typeIcon}`}>
          {getIcon()}
        </span>
        <span className={styles.message}>{toast.message}</span>
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
      >
        <span className={`material-symbols-outlined ${styles.icon}`}>
          close
        </span>
      </button>
    </div>
  );
}

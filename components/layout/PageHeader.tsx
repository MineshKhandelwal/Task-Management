import React from "react";
import styles from "./PageHeader.module.scss";

export interface PageHeaderProps {
  title: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
}

export default function PageHeader({
  title,
  badge,
  actionLabel,
  onAction,
  actionIcon = "add",
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onAction}
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>
            {actionIcon}
          </span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

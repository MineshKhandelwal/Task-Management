import React from "react";
import Button from "./Button";
import styles from "./States.module.scss";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`${styles.stateContainer} ${className || ""}`}>
      <div className={styles.iconWrapper}>
        <span className={`material-symbols-outlined ${styles.icon}`}>
          {icon}
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <div className={styles.action}>
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

import React from "react";
import Button from "./Button";
import styles from "./States.module.scss";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={`${styles.stateContainer} ${className || ""}`} role="alert">
      <div className={`${styles.iconWrapper} ${styles.errorIconWrapper}`}>
        <span className={`material-symbols-outlined ${styles.icon}`}>
          error_outline
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <div className={styles.action}>
          <Button
            variant="outline"
            size="sm"
            icon="refresh"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

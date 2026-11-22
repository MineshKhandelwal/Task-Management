import React from "react";
import styles from "./Badge.module.scss";

export type PriorityLevel = "Low" | "Medium" | "High" | "low" | "medium" | "high";

export interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  showText?: boolean;
}

export default function PriorityBadge({
  priority,
  className,
  showText = true,
}: PriorityBadgeProps) {
  const normalized = priority.toLowerCase() as "low" | "medium" | "high";
  const displayLabel = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={`${styles.priorityBadge} ${className || ""}`}
      title={`Priority: ${displayLabel}`}
    >
      <span
        className={`${styles.priorityDot} ${styles[normalized]}`}
        aria-hidden="true"
      />
      {showText && <span>{displayLabel}</span>}
    </span>
  );
}

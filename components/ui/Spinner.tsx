import React from "react";
import styles from "./Loading.module.scss";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Spinner({
  size = "md",
  color,
  className,
  ariaLabel = "Loading...",
}: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[`size-${size}`]} ${className || ""}`}
      style={color ? { color } : undefined}
      role="status"
      aria-label={ariaLabel}
    />
  );
}

import React from "react";
import styles from "./StatCard.module.scss";

export interface StatCardProps {
  label: string;
  value: number | string;
  accentColor?: string;
  suffix?: string;
}

export default function StatCard({
  label,
  value,
  accentColor = "var(--color-primary-container)",
  suffix = "",
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <div
        className={styles.accentStripe}
        style={{ backgroundColor: accentColor }}
      />
      <div className={styles.content}>
        <span className={styles.value}>
          {value}
          {suffix}
        </span>
        <span className={styles.label} title={label}>
          {label}
        </span>
      </div>
    </div>
  );
}

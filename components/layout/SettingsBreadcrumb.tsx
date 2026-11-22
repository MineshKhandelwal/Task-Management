import React from "react";
import Link from "next/link";
import styles from "./SettingsBreadcrumb.module.scss";

interface SettingsBreadcrumbProps {
  currentSection: string;
}

export default function SettingsBreadcrumb({ currentSection }: SettingsBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <span className={`material-symbols-outlined ${styles.icon}`}>settings</span>
      <Link href="/settings/users" className={styles.link}>
        Settings
      </Link>
      <span className={styles.separator}>&gt;</span>
      <span className={styles.current}>{currentSection}</span>
    </nav>
  );
}

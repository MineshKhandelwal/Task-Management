"use client";

import React from "react";
import Link from "next/link";
import styles from "./SettingsBreadcrumb.module.scss";

interface SettingsBreadcrumbProps {
  currentSection: "Users" | "Statuses" | string;
}

export default function SettingsBreadcrumb({ currentSection }: SettingsBreadcrumbProps) {
  const isUsers = currentSection.toLowerCase() === "users";
  const isStatuses = currentSection.toLowerCase() === "statuses";

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb Path */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <span className={`material-symbols-outlined ${styles.icon}`}>settings</span>
        <Link href="/settings/users" className={styles.link}>
          Settings
        </Link>
        <span className={styles.separator}>&gt;</span>
        <span className={styles.current}>{currentSection}</span>
      </nav>

      {/* Settings Sub-navigation Tabs */}
      <div className={styles.navTabs} role="tablist" aria-label="Settings navigation">
        <Link
          href="/settings/users"
          role="tab"
          aria-selected={isUsers}
          className={`${styles.tab} ${isUsers ? styles.active : ""}`}
        >
          <span className={`material-symbols-outlined ${styles.tabIcon}`}>
            group
          </span>
          <span>Users</span>
        </Link>

        <Link
          href="/settings/statuses"
          role="tab"
          aria-selected={isStatuses}
          className={`${styles.tab} ${isStatuses ? styles.active : ""}`}
        >
          <span className={`material-symbols-outlined ${styles.tabIcon}`}>
            label
          </span>
          <span>Statuses</span>
        </Link>
      </div>
    </div>
  );
}

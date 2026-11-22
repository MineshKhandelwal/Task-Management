"use client";

import React from "react";
import { StatusItem } from "@/store/services/statusesApi";
import styles from "./WorkflowRulesSidebar.module.scss";

interface WorkflowRulesSidebarProps {
  statuses: StatusItem[];
}

export default function WorkflowRulesSidebar({
  statuses,
}: WorkflowRulesSidebarProps) {
  const defaultStatus = statuses.find((s) => s.isDefault);
  const completionStatus = statuses.find((s) => s.isCompletion);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>Workflow Rules</span>
        <span className={`material-symbols-outlined ${styles.icon}`}>
          tune
        </span>
      </div>

      <p className={styles.description}>
        Status ordering dictates board column arrangement from left to right.
        Tasks created without an explicit state inherit the{" "}
        <span className={styles.highlight}>Default</span> status.
      </p>

      <div className={styles.rulesList}>
        <div className={styles.ruleItem}>
          <span className={styles.ruleLabel}>Default Entry</span>
          <span className={styles.ruleValue}>
            {defaultStatus ? defaultStatus.name : "None configured"}
          </span>
        </div>

        <div className={styles.ruleItem}>
          <span className={styles.ruleLabel}>Resolution State</span>
          <span className={styles.ruleValue}>
            {completionStatus ? completionStatus.name : "None configured"}
          </span>
        </div>
      </div>
    </aside>
  );
}

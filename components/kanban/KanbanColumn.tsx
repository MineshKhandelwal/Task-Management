"use client";

import React from "react";
import { StatusItem } from "@/store/services/statusesApi";
import { TaskItem } from "@/store/services/tasksApi";
import KanbanCard from "./KanbanCard";
import KanbanQuickAdd from "./KanbanQuickAdd";
import styles from "./KanbanColumn.module.scss";

interface KanbanColumnProps {
  status: StatusItem;
  statuses: StatusItem[];
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
  onStatusChange?: (task: TaskItem, newStatusId: string) => void;
}

export default function KanbanColumn({
  status,
  statuses,
  tasks,
  onTaskClick,
  onStatusChange,
}: KanbanColumnProps) {
  const statusColor = status.color || "#737687";

  return (
    <section
      className={styles.column}
      data-column-id={status._id}
      aria-label={`${status.name} column`}
    >
      {/* 3px Top Status Accent Line */}
      <div
        className={styles.topAccent}
        style={{ backgroundColor: statusColor }}
      />

      {/* Column Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span
            className={styles.colorIndicator}
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />
          <h2 className={styles.title}>{status.name}</h2>
        </div>
        <span className={styles.countBadge}>{tasks.length}</span>
      </div>

      {/* Tasks List */}
      <div className={styles.cardList}>
        {tasks.map((task) => (
          <KanbanCard
            key={task._id}
            task={task}
            statuses={statuses}
            onClick={onTaskClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Quick Add at bottom */}
      <div className={styles.footer}>
        <KanbanQuickAdd statusId={status._id} />
      </div>
    </section>
  );
}

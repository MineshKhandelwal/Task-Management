"use client";

import React from "react";
import Link from "next/link";
import { TaskItem } from "@/store/services/tasksApi";
import { formatRelativeTime, formatDate } from "@/lib/utils/dateUtils";
import styles from "./RecentTasksList.module.scss";

interface RecentTasksListProps {
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
}

const emptySubscribe = () => () => {};

export default function RecentTasksList({
  tasks,
  onTaskClick,
}: RecentTasksListProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recently Updated</h2>
        <Link href="/tasks" className={styles.viewAllLink}>
          View All
        </Link>
      </div>

      <div className={styles.list}>
        {tasks.length === 0 ? (
          <div className={styles.empty}>No recently updated tasks.</div>
        ) : (
          tasks.map((task, idx) => {
            const dateVal = task.updatedAt || task.createdAt;
            const timeLabel = mounted ? formatRelativeTime(dateVal) : formatDate(dateVal);

            return (
              <React.Fragment key={task._id}>
                {idx > 0 && <div className={styles.divider} />}
                <div
                  className={styles.row}
                  onClick={() => onTaskClick?.(task)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onTaskClick?.(task);
                    }
                  }}
                >
                  <div className={styles.leftGroup}>
                    <span className={styles.taskId}>
                      TASK-{task._id.slice(-4).toUpperCase()}
                    </span>
                    <span className={styles.taskTitle} title={task.title}>
                      {task.title}
                    </span>
                  </div>
                  <span className={styles.time}>{timeLabel}</span>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

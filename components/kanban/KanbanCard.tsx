"use client";

import React from "react";
import { Avatar, PriorityBadge } from "@/components/ui";
import { TaskItem } from "@/store/services/tasksApi";
import { StatusItem } from "@/store/services/statusesApi";
import { formatDate, isOverdue } from "@/lib/utils/dateUtils";
import styles from "./KanbanCard.module.scss";

interface KanbanCardProps {
  task: TaskItem;
  statuses?: StatusItem[];
  onClick?: (task: TaskItem) => void;
  onStatusChange?: (task: TaskItem, newStatusId: string) => void;
}

export default function KanbanCard({
  task,
  statuses,
  onClick,
  onStatusChange,
}: KanbanCardProps) {
  const isComplete = !!task.status?.isCompletion;
  const overdue = !isComplete && isOverdue(task.dueDate);

  // Status accent color or default
  const statusColor = task.status?.color || "#737687";

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if user clicked on status select dropdown
    if ((e.target as HTMLElement).closest(`.${styles.statusSelectWrapper}`)) {
      return;
    }
    onClick?.(task);
  };

  const handleStatusSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatusId = e.target.value;
    if (newStatusId && newStatusId !== task.status?._id) {
      onStatusChange?.(task, newStatusId);
    }
  };

  return (
    <article
      className={`${styles.card} ${overdue ? styles.overdue : ""} ${
        isComplete ? styles.completed : ""
      }`}
      onClick={handleCardClick}
      data-task-id={task._id}
      aria-label={`Task: ${task.title}`}
    >
      {/* 3px Accent Stripe on Left */}
      <div
        className={styles.accentStripe}
        style={{ backgroundColor: overdue ? undefined : statusColor }}
      />

      {/* Top Row: Task ID & Priority Badge */}
      <div className={styles.topRow}>
        <span className={styles.taskId}>
          TASK-{task._id.slice(-4).toUpperCase()}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <p className={styles.title}>{task.title}</p>

      {/* Bottom Row: Assignee, Due Date & Quick Status Changer */}
      <div className={styles.bottomRow}>
        <div className={styles.assigneeGroup}>
          {task.assignedTo ? (
            <>
              <Avatar
                size="sm"
                name={task.assignedTo.name}
                color={task.assignedTo.avatarColor}
              />
              <span className={styles.assigneeName} title={task.assignedTo.name}>
                {task.assignedTo.name}
              </span>
            </>
          ) : (
            <span className={styles.unassigned}>Unassigned</span>
          )}
        </div>

        <div className={styles.rightGroup}>
          {task.dueDate && (
            <div
              className={`${styles.dueDate} ${overdue ? styles.isOverdue : ""}`}
              title={overdue ? "Overdue" : "Due date"}
            >
              {overdue && (
                <span
                  className={`material-symbols-outlined ${styles.warningIcon}`}
                >
                  warning
                </span>
              )}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Quick status selector to move task without drag-and-drop */}
          {statuses && statuses.length > 0 && (
            <div className={styles.statusSelectWrapper} onClick={(e) => e.stopPropagation()}>
              <select
                className={styles.statusSelect}
                value={task.status?._id || ""}
                onChange={handleStatusSelectChange}
                aria-label="Change status"
              >
                {statuses.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span
                className={`material-symbols-outlined ${styles.selectArrow}`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

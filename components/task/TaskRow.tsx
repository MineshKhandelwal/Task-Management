"use client";

import React from "react";
import { Avatar, StatusBadge, PriorityBadge } from "@/components/ui";
import { TaskItem } from "@/store/services/tasksApi";
import { isOverdue, formatDate } from "@/lib/utils/dateUtils";
import styles from "./TaskRow.module.scss";

interface TaskRowProps {
  task: TaskItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: (task: TaskItem) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
}

export default function TaskRow({
  task,
  isSelected = false,
  onToggleSelect,
  onClick,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const isCompleted = !!task.status?.isCompletion;
  const overdue = isOverdue(task.dueDate, isCompleted);
  const displayId = `TF-${task._id.slice(-4).toUpperCase()}`;

  const rowClasses = [
    styles.row,
    overdue ? styles.overdue : "",
    isCompleted ? styles.completed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr
      className={rowClasses}
      onClick={() => onClick?.(task)}
    >
      {/* Checkbox column */}
      <td
        className={styles.cell}
        style={{ width: "48px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={isSelected}
          onChange={() => onToggleSelect?.(task._id)}
          aria-label={`Select task ${task.title}`}
        />
      </td>

      {/* ID & Title */}
      <td className={styles.cell}>
        <div className={styles.titleGroup}>
          <span className={styles.taskId}>{displayId}</span>
          <span className={styles.taskTitle} title={task.title}>
            {task.title}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className={styles.cell} style={{ width: "140px" }}>
        <StatusBadge
          name={task.status?.name || "Unknown"}
          color={task.status?.color}
        />
      </td>

      {/* Priority */}
      <td className={styles.cell} style={{ width: "120px" }}>
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Assignee */}
      <td className={styles.cell} style={{ width: "160px" }}>
        {task.assignedTo ? (
          <div className={styles.assigneeGroup}>
            <Avatar
              name={task.assignedTo.name}
              size="sm"
              color={task.assignedTo.avatarColor}
            />
            <span className={styles.assigneeName} title={task.assignedTo.name}>
              {task.assignedTo.name}
            </span>
          </div>
        ) : (
          <span style={{ color: "var(--color-outline)" }}>Unassigned</span>
        )}
      </td>

      {/* Due Date */}
      <td className={styles.cell} style={{ width: "130px" }}>
        <span
          className={`${styles.dueDateText} ${
            overdue ? styles.overdueText : ""
          }`}
        >
          {formatDate(task.dueDate)}
        </span>
      </td>

      {/* Actions */}
      <td
        className={`${styles.cell} ${styles.actionsCell}`}
        style={{ width: "80px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.actionBtn}
          title="Edit Task"
          aria-label={`Edit ${task.title}`}
          onClick={() => onEdit?.(task)}
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>
            edit
          </span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          title="Delete Task"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete?.(task)}
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>
            delete
          </span>
        </button>
      </td>
    </tr>
  );
}

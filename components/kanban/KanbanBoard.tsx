"use client";

import React, { useMemo } from "react";
import { StatusItem } from "@/store/services/statusesApi";
import { TaskItem, useUpdateTaskMutation } from "@/store/services/tasksApi";
import { useToast } from "@/components/ui";
import KanbanColumn from "./KanbanColumn";
import styles from "./KanbanBoard.module.scss";

interface KanbanBoardProps {
  tasks: TaskItem[];
  statuses: StatusItem[];
  isLoading?: boolean;
  onOpenCreate?: () => void;
  onTaskClick?: (task: TaskItem) => void;
}

export default function KanbanBoard({
  tasks,
  statuses,
  isLoading,
  onTaskClick,
}: KanbanBoardProps) {
  const toast = useToast();
  const [updateTask] = useUpdateTaskMutation();

  // Sort statuses by order ascending
  const sortedStatuses = useMemo(() => {
    return [...statuses].sort((a, b) => a.order - b.order);
  }, [statuses]);

  // Group tasks by status ID
  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    for (const status of sortedStatuses) {
      map[status._id] = [];
    }

    for (const task of tasks) {
      const statusId = task.status?._id;
      if (statusId && map[statusId]) {
        map[statusId].push(task);
      } else if (sortedStatuses[0]) {
        // Fallback to first status column if status unknown
        map[sortedStatuses[0]._id]?.push(task);
      }
    }

    return map;
  }, [tasks, sortedStatuses]);

  const handleStatusChange = async (task: TaskItem, newStatusId: string) => {
    try {
      await updateTask({
        id: task._id,
        data: { status: newStatusId },
      }).unwrap();

      const newStatus = sortedStatuses.find((s) => s._id === newStatusId);
      toast.success(
        `Task moved to '${newStatus?.name || "new status"}'.`
      );
    } catch {
      toast.error("Failed to update task status.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.boardContainer}>
        <div className={styles.board}>
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className={styles.skeletonColumn}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {sortedStatuses.map((status) => (
          <KanbanColumn
            key={status._id}
            status={status}
            statuses={sortedStatuses}
            tasks={tasksByStatus[status._id] || []}
            onTaskClick={onTaskClick}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

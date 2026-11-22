"use client";

import React, { useState } from "react";
import { Pagination, Skeleton, EmptyState, ErrorState, ConfirmDialog, useToast } from "@/components/ui";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  TaskItem,
} from "@/store/services/tasksApi";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import TaskRow from "./TaskRow";
import QuickAddTaskRow from "./QuickAddTaskRow";
import TaskFormModal from "./TaskFormModal";
import styles from "./TaskTable.module.scss";

interface TaskTableProps {
  onOpenCreate?: () => void;
}

export default function TaskTable({ onOpenCreate }: TaskTableProps) {
  const { filters, setFilter, setFilters, resetFilters } = useTaskFilters();
  const { data, isLoading, isError, refetch } = useGetTasksQuery(filters);
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const toast = useToast();

  const hasFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.assignedTo ||
    filters.createdBy ||
    filters.dueBefore ||
    filters.dueAfter
  );

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  const tasks = data?.tasks || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleToggleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t._id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: "title" | "priority" | "dueDate" | "createdAt") => {
    const isSameField = filters.sortBy === field;
    const newOrder = isSameField && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilters({ sortBy: field, sortOrder: newOrder });
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete._id).unwrap();
      toast.success(`Task '${taskToDelete.title}' deleted.`);
      setTaskToDelete(null);
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  const renderSortIcon = (field: string) => {
    if (filters.sortBy !== field) return null;
    return (
      <span className={`material-symbols-outlined ${styles.sortIcon}`}>
        {filters.sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.th} style={{ width: "48px" }}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                  onChange={handleToggleSelectAll}
                  aria-label="Select all tasks"
                />
              </th>
              <th
                className={`${styles.th} ${styles.sortable}`}
                onClick={() => handleSort("title")}
              >
                <div className={styles.sortContent}>
                  <span>Title</span>
                  {renderSortIcon("title")}
                </div>
              </th>
              <th className={styles.th} style={{ width: "140px" }}>
                Status
              </th>
              <th
                className={`${styles.th} ${styles.sortable}`}
                style={{ width: "120px" }}
                onClick={() => handleSort("priority")}
              >
                <div className={styles.sortContent}>
                  <span>Priority</span>
                  {renderSortIcon("priority")}
                </div>
              </th>
              <th className={styles.th} style={{ width: "160px" }}>
                Assignee
              </th>
              <th
                className={`${styles.th} ${styles.sortable}`}
                style={{ width: "130px" }}
                onClick={() => handleSort("dueDate")}
              >
                <div className={styles.sortContent}>
                  <span>Due Date</span>
                  {renderSortIcon("dueDate")}
                </div>
              </th>
              <th className={styles.th} style={{ width: "80px", textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-surface-container-high)" }}>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="18px" height="18px" /></td>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="65%" height="16px" /></td>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="80px" height="20px" borderRadius="2px" /></td>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="60px" height="16px" /></td>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="110px" height="16px" /></td>
                  <td style={{ padding: "12px 16px" }}><Skeleton width="75px" height="16px" /></td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}><Skeleton width="24px" height="24px" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px 0" }}>
                  <ErrorState
                    title="Failed to load tasks"
                    message="An error occurred while loading tasks. Please try again."
                    onRetry={refetch}
                  />
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title={hasFilters ? "No matching tasks found" : "No tasks yet"}
                    description={
                      hasFilters
                        ? "No tasks match your current filter criteria. Try clearing filters or adjusting search terms."
                        : "Get started by creating your first task or using the quick-add row below."
                    }
                    actionLabel={hasFilters ? "Clear Filters" : "Create Task"}
                    onAction={hasFilters ? resetFilters : onOpenCreate}
                  />
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  isSelected={selectedTaskIds.includes(task._id)}
                  onToggleSelect={handleToggleSelect}
                  onClick={(t) => setTaskToEdit(t)}
                  onEdit={(t) => setTaskToEdit(t)}
                  onDelete={(t) => setTaskToDelete(t)}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Jira-style fast inline task creation row */}
        <QuickAddTaskRow />
      </div>

      {/* Pagination Footer */}
      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(p) => setFilter("page", p)}
        onPageSizeChange={(limit) => setFilter("limit", limit)}
      />

      {/* Edit Task Modal */}
      {taskToEdit && (
        <TaskFormModal
          isOpen={!!taskToEdit}
          onClose={() => setTaskToEdit(null)}
          taskToEdit={taskToEdit}
        />
      )}

      {/* Delete Task Confirmation */}
      {taskToDelete && (
        <ConfirmDialog
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete '${taskToDelete.title}'? This action can be undone by an administrator.`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

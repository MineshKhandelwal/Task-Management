"use client";

import React, { Suspense, useState } from "react";
import { PageShell, PageHeader } from "@/components/layout";
import { Spinner } from "@/components/ui";
import FilterBar from "@/components/task/FilterBar";
import TaskFormModal from "@/components/task/TaskFormModal";
import { KanbanBoard } from "@/components/kanban";
import { useGetTasksQuery, TaskItem } from "@/store/services/tasksApi";
import { useGetStatusesQuery } from "@/store/services/statusesApi";
import { useTaskFilters } from "@/hooks/useTaskFilters";

function BoardContent({
  onOpenCreate,
  onTaskClick,
}: {
  onOpenCreate: () => void;
  onTaskClick: (task: TaskItem) => void;
}) {
  const { filters } = useTaskFilters();
  const { data: statusesData, isLoading: isLoadingStatuses } = useGetStatusesQuery();
  // Fetch up to 100 tasks on board to avoid pagination fragmentation
  const { data: tasksData, isLoading: isLoadingTasks } = useGetTasksQuery({
    ...filters,
    limit: 100,
  });

  const statuses = statusesData || [];
  const tasks = tasksData?.tasks || [];
  const isLoading = isLoadingStatuses || isLoadingTasks;

  return (
    <>
      <FilterBar />
      <KanbanBoard
        tasks={tasks}
        statuses={statuses}
        isLoading={isLoading}
        onOpenCreate={onOpenCreate}
        onTaskClick={onTaskClick}
      />
    </>
  );
}

export default function BoardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);

  return (
    <PageShell currentPage="board">
      <PageHeader
        title="Board"
        badge="SPRINT 42"
        actionLabel="CREATE TASK"
        onAction={() => setIsCreateOpen(true)}
      />

      <Suspense
        fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
            <Spinner size="lg" />
          </div>
        }
      >
        <BoardContent
          onOpenCreate={() => setIsCreateOpen(true)}
          onTaskClick={(task) => setTaskToEdit(task)}
        />
      </Suspense>

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Edit / View Task Modal */}
      {taskToEdit && (
        <TaskFormModal
          isOpen={!!taskToEdit}
          onClose={() => setTaskToEdit(null)}
          taskToEdit={taskToEdit}
        />
      )}
    </PageShell>
  );
}

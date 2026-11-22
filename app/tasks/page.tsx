"use client";

import React, { Suspense, useState } from "react";
import { PageShell, PageHeader } from "@/components/layout";
import { Spinner } from "@/components/ui";
import FilterBar from "@/components/task/FilterBar";
import TaskTable from "@/components/task/TaskTable";
import TaskFormModal from "@/components/task/TaskFormModal";

function TasksContent({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <>
      <FilterBar />
      <TaskTable onOpenCreate={onOpenCreate} />
    </>
  );
}

export default function TasksPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <PageShell currentPage="tasks">
      <PageHeader
        title="Tasks"
        badge="/tasks"
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
        <TasksContent onOpenCreate={() => setIsCreateOpen(true)} />
      </Suspense>

      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </PageShell>
  );
}

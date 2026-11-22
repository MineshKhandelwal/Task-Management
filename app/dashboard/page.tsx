"use client";

import React, { useState } from "react";
import { PageShell, PageHeader } from "@/components/layout";
import { Spinner } from "@/components/ui";
import {
  StatCard,
  StatusBarChart,
  PriorityBarChart,
  UserPerformanceList,
  RecentTasksList,
} from "@/components/dashboard";
import TaskFormModal from "@/components/task/TaskFormModal";
import { useGetDashboardStatsQuery, TaskItem } from "@/store/services/tasksApi";
import styles from "./Dashboard.module.scss";

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);

  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  // Find in-progress count from byStatus if available
  const inProgressStatus = stats?.byStatus.find((s) =>
    s.name.toLowerCase().includes("in progress")
  );
  const inProgressCount = inProgressStatus ? inProgressStatus.count : 0;

  return (
    <PageShell currentPage="dashboard">
      <PageHeader
        title="Dashboard"
        actionLabel="CREATE TASK"
        onAction={() => setIsCreateOpen(true)}
      />

      {isLoading || !stats ? (
        <div className={styles.loadingWrapper}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.container}>
          {/* Top 5 Stat Cards */}
          <div className={styles.statsGrid}>
            <StatCard
              label="Total Tasks"
              value={stats.total}
              accentColor="#0f62fe"
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              accentColor="#006a68"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue}
              accentColor="#ba1a1a"
            />
            <StatCard
              label="In Progress"
              value={inProgressCount}
              accentColor="#0f62fe"
            />
            <StatCard
              label="% Done"
              value={stats.completionPercentage}
              suffix="%"
              accentColor="#006a68"
            />
          </div>

          {/* Charts Row: Status and Priority */}
          <div className={styles.twoColGrid}>
            <StatusBarChart data={stats.byStatus} total={stats.total} />
            <PriorityBarChart data={stats.byPriority} total={stats.total} />
          </div>

          {/* Activity Row: User Performance and Recent Tasks */}
          <div className={styles.twoColGrid}>
            <UserPerformanceList data={stats.byUser} />
            <RecentTasksList
              tasks={stats.recentTasks}
              onTaskClick={(task) => setTaskToEdit(task)}
            />
          </div>
        </div>
      )}

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

"use client";

import React, { useState } from "react";
import { PageShell, PageHeader } from "@/components/layout";
import { Skeleton, ErrorState } from "@/components/ui";
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

  const { data: stats, isLoading, error, refetch } = useGetDashboardStatsQuery();

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

      {error ? (
        <div style={{ padding: "64px 0" }}>
          <ErrorState
            title="Failed to load dashboard metrics"
            message="Could not load the statistics. Please try again."
            onRetry={refetch}
          />
        </div>
      ) : isLoading || !stats ? (
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: "96px", backgroundColor: "var(--color-surface-container-lowest)", padding: "16px", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.04)" }}>
                <Skeleton width="40%" height="32px" />
                <div style={{ marginTop: "12px" }}>
                  <Skeleton width="60%" height="14px" />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.twoColGrid}>
            <div style={{ height: "240px", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "2px", padding: "16px" }}>
              <Skeleton width="30%" height="20px" />
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <Skeleton width="100%" height="20px" />
                <Skeleton width="80%" height="20px" />
                <Skeleton width="90%" height="20px" />
              </div>
            </div>
            <div style={{ height: "240px", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "2px", padding: "16px" }}>
              <Skeleton width="30%" height="20px" />
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <Skeleton width="100%" height="20px" />
                <Skeleton width="70%" height="20px" />
                <Skeleton width="85%" height="20px" />
              </div>
            </div>
          </div>
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

import React from "react";
import { Avatar } from "@/components/ui";
import styles from "./UserPerformanceList.module.scss";

export interface UserPerformanceItem {
  userId: string;
  name: string;
  avatarColor: string;
  total: number;
  completed: number;
  completionPercentage: number;
}

interface UserPerformanceListProps {
  data: UserPerformanceItem[];
}

export default function UserPerformanceList({ data }: UserPerformanceListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Performance</h2>
        <span className={styles.subtitle}>Completed Tasks</span>
      </div>

      <div className={styles.list}>
        {data.length === 0 ? (
          <div className={styles.empty}>No team performance data available.</div>
        ) : (
          data.map((user) => (
            <div key={user.userId} className={styles.row}>
              <Avatar
                size="sm"
                name={user.name}
                color={user.avatarColor}
              />
              <span className={styles.name} title={user.name}>
                {user.name}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${Math.min(100, Math.max(0, user.completionPercentage))}%` }}
                  title={`${user.completed} completed of ${user.total} tasks (${user.completionPercentage}%)`}
                />
              </div>
              <span
                className={styles.count}
                title={`${user.completed} completed of ${user.total}`}
              >
                {user.completed}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

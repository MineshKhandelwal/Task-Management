import React from "react";
import styles from "./StatusBarChart.module.scss";

export interface StatusStatItem {
  statusId: string;
  name: string;
  color: string;
  count: number;
}

interface StatusBarChartProps {
  data: StatusStatItem[];
  total: number;
}

export default function StatusBarChart({ data, total }: StatusBarChartProps) {
  // Max count to scale bars proportionally (or relative to total)
  const maxVal = total > 0 ? total : 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tasks by Status</h2>
        <span className={styles.totalBadge}>N = {total}</span>
      </div>

      <div className={styles.chartArea}>
        {/* Background grid lines for 0%, 25%, 50%, 75%, 100% */}
        <div className={styles.gridLines}>
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>

        {/* Data Rows */}
        {data.map((item) => {
          const percentage = total > 0 ? (item.count / maxVal) * 100 : 0;
          return (
            <div key={item.statusId} className={styles.row}>
              <span className={styles.label} title={item.name}>
                {item.name}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || "var(--color-primary-container)",
                  }}
                  title={`${item.name}: ${item.count} (${percentage.toFixed(1)}%)`}
                />
              </div>
              <span className={styles.count}>{item.count}</span>
            </div>
          );
        })}

        {/* Scale Axis */}
        <div className={styles.scaleAxis}>
          <span>0</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

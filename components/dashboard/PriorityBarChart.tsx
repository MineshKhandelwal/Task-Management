import React from "react";
import styles from "./PriorityBarChart.module.scss";

export interface PriorityStatItem {
  priority: "high" | "medium" | "low";
  count: number;
}

interface PriorityBarChartProps {
  data: PriorityStatItem[];
  total: number;
}

const PRIORITY_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "var(--color-error)",
  medium: "var(--color-tertiary-container)",
  low: "var(--color-outline)",
};

export default function PriorityBarChart({ data, total }: PriorityBarChartProps) {
  const maxVal = total > 0 ? total : 1;

  // Order priority high -> medium -> low
  const order: Array<"high" | "medium" | "low"> = ["high", "medium", "low"];
  const sortedData = [...data].sort(
    (a, b) => order.indexOf(a.priority) - order.indexOf(b.priority)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tasks by Priority</h2>
        <span className={styles.subtitle}>ACTIVE TRIAGE</span>
      </div>

      <div className={styles.chartArea}>
        {/* Background grid lines */}
        <div className={styles.gridLines}>
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>

        {/* Data Rows */}
        {sortedData.map((item) => {
          const percentage = total > 0 ? (item.count / maxVal) * 100 : 0;
          return (
            <div key={item.priority} className={styles.row}>
              <span className={styles.label}>{item.priority}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: PRIORITY_COLORS[item.priority],
                  }}
                  title={`${item.priority}: ${item.count} (${percentage.toFixed(1)}%)`}
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

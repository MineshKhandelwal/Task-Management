"use client";

import React, { useState } from "react";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui";
import {
  useGetStatusesQuery,
  useUpdateStatusMutation,
  StatusItem,
} from "@/store/services/statusesApi";
import StatusFormModal from "./StatusFormModal";
import StatusDeleteDialog from "./StatusDeleteDialog";
import styles from "./StatusList.module.scss";

interface StatusListProps {
  onEditStatus: (status: StatusItem) => void;
  onDeleteStatus: (status: StatusItem) => void;
}

export default function StatusList({
  onEditStatus,
  onDeleteStatus,
}: StatusListProps) {
  const { data: statuses, isLoading, error, refetch } = useGetStatusesQuery();
  const [updateStatus] = useUpdateStatusMutation();

  const statusList = statuses || [];

  const handleOrderChange = async (status: StatusItem, delta: number) => {
    const newOrder = Math.max(0, status.order + delta);
    if (newOrder === status.order) return;

    await updateStatus({
      id: status._id,
      data: { order: newOrder },
    });
  };

  if (error) {
    return (
      <div style={{ padding: "32px 0" }}>
        <ErrorState
          title="Failed to load statuses"
          message="Could not load workflow statuses. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.leftGroup} style={{ flex: 1 }}>
              <Skeleton width="18px" height="18px" />
              <Skeleton width="14px" height="14px" />
              <Skeleton width="120px" height="16px" />
              <Skeleton width="60px" height="14px" />
            </div>
            <div className={styles.actions}>
              <Skeleton width="60px" height="24px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (statusList.length === 0) {
    return (
      <EmptyState
        title="No statuses configured"
        description="Add a new status to organize tasks on the board."
      />
    );
  }

  return (
    <div className={styles.list}>
      {statusList.map((status) => (
        <div key={status._id} className={styles.row}>
          <div className={styles.leftGroup}>
            <span className={styles.dragHandle} title="Drag handle">
              ⠿
            </span>

            <span
              className={styles.swatch}
              style={{ backgroundColor: status.color }}
            />

            <span className={styles.name} title={status.name}>
              {status.name}
            </span>

            <span className={styles.hexCode}>{status.color}</span>

            {status.isDefault && (
              <span className={styles.badgeDefault}>Default</span>
            )}

            {status.isCompletion && (
              <span className={styles.badgeDone}>Done</span>
            )}
          </div>

          <div className={styles.rightGroup}>
            <div className={styles.orderGroup}>
              <span className={styles.orderLabel}>Order</span>
              <span className={styles.orderBadge}>{status.order}</span>
              <button
                type="button"
                className={styles.iconBtn}
                style={{ width: "20px", height: "20px" }}
                title="Increase order"
                onClick={() => handleOrderChange(status, 1)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  expand_less
                </span>
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                style={{ width: "20px", height: "20px" }}
                title="Decrease order"
                onClick={() => handleOrderChange(status, -1)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  expand_more
                </span>
              </button>
            </div>

            <div className={styles.actionBtns}>
              <button
                type="button"
                className={styles.iconBtn}
                title={`Edit ${status.name}`}
                aria-label={`Edit ${status.name}`}
                onClick={() => onEditStatus(status)}
              >
                <span className={`material-symbols-outlined ${styles.icon}`}>
                  edit
                </span>
              </button>

              <button
                type="button"
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                title={`Delete ${status.name}`}
                aria-label={`Delete ${status.name}`}
                onClick={() => onDeleteStatus(status)}
              >
                <span className={`material-symbols-outlined ${styles.icon}`}>
                  delete
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

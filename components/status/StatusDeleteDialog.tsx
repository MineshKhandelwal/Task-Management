"use client";

import React, { useState } from "react";
import { Modal, Button, Select, Spinner, useToast } from "@/components/ui";
import {
  useGetStatusUsageQuery,
  useDeleteStatusMutation,
  StatusItem,
} from "@/store/services/statusesApi";
import styles from "./StatusDeleteDialog.module.scss";

interface StatusDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  statusToDelete: StatusItem | null;
  availableStatuses: StatusItem[];
}

export default function StatusDeleteDialog({
  isOpen,
  onClose,
  statusToDelete,
  availableStatuses,
}: StatusDeleteDialogProps) {
  const toast = useToast();
  const [deleteStatus, { isLoading: isDeleting }] = useDeleteStatusMutation();

  const otherStatuses = availableStatuses.filter(
    (s) => s._id !== statusToDelete?._id
  );

  const [selectedReassignTo, setSelectedReassignTo] = useState<string>("");
  const targetReassignTo = selectedReassignTo || (otherStatuses[0]?._id ?? "");

  const { data: usageData, isLoading: isLoadingUsage } =
    useGetStatusUsageQuery(statusToDelete?._id || "", {
      skip: !statusToDelete?._id,
    });

  const taskCount = usageData?.taskCount || 0;
  const isDefault = !!statusToDelete?.isDefault;
  const isCompletion = !!statusToDelete?.isCompletion;
  const cannotDelete = isDefault || isCompletion;

  const handleDelete = async () => {
    if (!statusToDelete) return;

    if (cannotDelete) {
      toast.error("Cannot delete a default or completion status.");
      return;
    }

    if (taskCount > 0 && !targetReassignTo) {
      toast.error("Please select a target status to reassign existing tasks.");
      return;
    }

    try {
      const res = await deleteStatus({
        id: statusToDelete._id,
        reassignTo: taskCount > 0 ? targetReassignTo : undefined,
      }).unwrap();

      toast.success(res.message);
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(error.data?.error?.message || "Failed to delete status.");
    }
  };

  const footer = (
    <div className={styles.footerActions}>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isDeleting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
        isLoading={isDeleting}
        disabled={cannotDelete || isLoadingUsage}
      >
        Delete Status
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Status"
      footer={footer}
      maxWidth="480px"
    >
      <div className={styles.content}>
        {isDefault && (
          <div className={styles.warningBox}>
            <strong>Default status cannot be deleted.</strong> You must set
            another status as the default status first before deleting &apos;{statusToDelete?.name}&apos;.
          </div>
        )}

        {isCompletion && (
          <div className={styles.warningBox}>
            <strong>Completion status cannot be deleted.</strong> You must set
            another status as the resolution/completion status first before deleting &apos;{statusToDelete?.name}&apos;.
          </div>
        )}

        {!cannotDelete && (
          <>
            <p>
              Are you sure you want to delete status <strong>&apos;{statusToDelete?.name}&apos;</strong>?
            </p>

            {isLoadingUsage ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Spinner size="sm" />
                <span>Checking status usage...</span>
              </div>
            ) : taskCount > 0 ? (
              <div className={styles.reassignGroup}>
                <div className={styles.warningBox}>
                  <strong>Action Required:</strong> {taskCount} task(s) currently use this status.
                  Please select where to reassign these tasks.
                </div>
                <label className={styles.reassignLabel}>Reassign tasks to</label>
                <Select
                  value={targetReassignTo}
                  onChange={(e) => setSelectedReassignTo(e.target.value)}
                  options={otherStatuses.map((s) => ({
                    value: s._id,
                    label: s.name,
                  }))}
                />
              </div>
            ) : (
              <p style={{ color: "var(--color-on-surface-variant)" }}>
                No active tasks currently use this status. It can be safely removed.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

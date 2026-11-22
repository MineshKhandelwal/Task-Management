"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, useToast } from "@/components/ui";
import {
  createStatusSchema,
  CreateStatusInput,
} from "@/lib/validations/statusSchema";
import {
  useCreateStatusMutation,
  useUpdateStatusMutation,
  StatusItem,
} from "@/store/services/statusesApi";
import styles from "./StatusFormModal.module.scss";

interface StatusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusToEdit?: StatusItem | null;
  nextOrder?: number;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#6B7280", // gray (to do)
  "#0f62fe", // blue (in progress)
  "#c84000", // orange (in review)
  "#006a68", // teal (completed)
  "#ba1a1a", // red
  "#7ef2ee", // light teal
  "#F1C21B", // yellow
  "#2f3131", // dark
];

interface StatusFormData {
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  isCompletion?: boolean;
}

export default function StatusFormModal({
  isOpen,
  onClose,
  statusToEdit,
  nextOrder = 0,
  onSuccess,
}: StatusFormModalProps) {
  const isEditing = !!statusToEdit;
  const toast = useToast();

  const [createStatus, { isLoading: isCreating }] = useCreateStatusMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StatusFormData>({
    resolver: zodResolver(createStatusSchema) as any,
    defaultValues: {
      name: "",
      color: PRESET_COLORS[0],
      order: nextOrder,
      isDefault: false,
      isCompletion: false,
    },
  });

  const currentColor = watch("color");

  useEffect(() => {
    if (statusToEdit) {
      reset({
        name: statusToEdit.name,
        color: statusToEdit.color,
        order: statusToEdit.order,
        isDefault: statusToEdit.isDefault,
        isCompletion: statusToEdit.isCompletion,
      });
    } else {
      reset({
        name: "",
        color: PRESET_COLORS[0],
        order: nextOrder,
        isDefault: false,
        isCompletion: false,
      });
    }
  }, [statusToEdit, nextOrder, reset]);

  const onSubmit = async (data: StatusFormData) => {
    try {
      if (isEditing && statusToEdit) {
        await updateStatus({
          id: statusToEdit._id,
          data: {
            name: data.name,
            color: data.color,
            order: data.order,
            isDefault: data.isDefault,
            isCompletion: data.isCompletion,
          },
        }).unwrap();
        toast.success(`Status '${data.name}' updated successfully.`);
      } else {
        await createStatus({
          name: data.name,
          color: data.color,
          order: data.order,
          isDefault: data.isDefault,
          isCompletion: data.isCompletion,
        }).unwrap();
        toast.success(`Status '${data.name}' created successfully.`);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(
        error.data?.error?.message ||
          `Failed to ${isEditing ? "update" : "create"} status.`
      );
    }
  };

  const footer = (
    <div className={styles.footerActions}>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="status-form"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isEditing ? "Save Changes" : "Create Status"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Status" : "New Status"}
      footer={footer}
      maxWidth="480px"
    >
      <form id="status-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Status Name"
          placeholder="e.g. In Testing"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <div className={styles.colorGroup}>
          <label className={styles.colorLabel}>Badge Color</label>
          <div className={styles.colorRow}>
            <div
              className={styles.swatchPreview}
              style={{ backgroundColor: currentColor }}
            />
            <Input
              placeholder="#0F62FE"
              error={errors.color?.message}
              {...register("color")}
            />
          </div>
          <div className={styles.presets}>
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`${styles.presetBtn} ${
                  currentColor?.toLowerCase() === hex.toLowerCase()
                    ? styles.activePreset
                    : ""
                }`}
                style={{ backgroundColor: hex }}
                onClick={() => setValue("color", hex, { shouldValidate: true })}
                title={`Select ${hex}`}
              />
            ))}
          </div>
        </div>

        <Input
          label="Display Order"
          type="number"
          min={0}
          required
          error={errors.order?.message}
          {...register("order", { valueAsNumber: true })}
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register("isDefault")} />
            <span>Default status for new tasks</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register("isCompletion")} />
            <span>Marks task as completed / resolved</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

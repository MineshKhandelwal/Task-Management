"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Input,
  Textarea,
  Select,
  ConfirmDialog,
  useToast,
} from "@/components/ui";
import { createTaskSchema } from "@/lib/validations/taskSchema";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  TaskItem,
} from "@/store/services/tasksApi";
import { useGetStatusesQuery } from "@/store/services/statusesApi";
import { useGetUsersQuery } from "@/store/services/usersApi";
import { toInputDateFormat, formatDate } from "@/lib/utils/dateUtils";
import styles from "./TaskFormModal.module.scss";

interface TaskFormData {
  title: string;
  description?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  assignedTo?: string | null;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
  initialStatusId?: string;
  onSuccess?: () => void;
}

export default function TaskFormModal({
  isOpen,
  onClose,
  taskToEdit,
  initialStatusId,
  onSuccess,
}: TaskFormModalProps) {
  const isEditing = !!taskToEdit;
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: statuses } = useGetStatusesQuery();
  const { data: users } = useGetUsersQuery({ isActive: true });

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const isSubmitting = isCreating || isUpdating;

  const defaultStatusId =
    initialStatusId ||
    statuses?.find((s) => s.isDefault)?._id ||
    statuses?.[0]?._id ||
    "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatusId,
      priority: "medium",
      dueDate: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        status: taskToEdit.status?._id || defaultStatusId,
        priority: taskToEdit.priority || "medium",
        dueDate: toInputDateFormat(taskToEdit.dueDate),
        assignedTo: taskToEdit.assignedTo?._id || "",
      });
    } else {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 7);
      reset({
        title: "",
        description: "",
        status: defaultStatusId,
        priority: "medium",
        dueDate: toInputDateFormat(defaultDue),
        assignedTo: "",
      });
    }
  }, [isOpen, taskToEdit, defaultStatusId, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (isEditing && taskToEdit) {
        await updateTask({
          id: taskToEdit._id,
          data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
            assignedTo: data.assignedTo || null,
          },
        }).unwrap();
        toast.success(`Task '${data.title}' updated.`);
      } else {
        await createTask({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          assignedTo: data.assignedTo || null,
        }).unwrap();
        toast.success(`Task '${data.title}' created.`);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(
        error.data?.error?.message ||
          `Failed to ${isEditing ? "update" : "create"} task.`
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToEdit) return;
    try {
      await deleteTask(taskToEdit._id).unwrap();
      toast.success(`Task '${taskToEdit.title}' deleted.`);
      setIsDeleteDialogOpen(false);
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  const modalTitle = isEditing
    ? `Edit Task — TASK-${taskToEdit._id.slice(-4).toUpperCase()}`
    : "Create Task";

  const footer = (
    <div className={styles.footerActions}>
      {isEditing && (
        <Button
          type="button"
          variant="danger"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isSubmitting || isDeleting}
        >
          Delete Task
        </Button>
      )}
      <div className={styles.rightFooterActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting || isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="task-modal-form"
          variant="primary"
          isLoading={isSubmitting}
        >
          {isEditing ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        footer={footer}
        maxWidth="640px"
      >
        <form
          id="task-modal-form"
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          <Input
            label="Title"
            placeholder="e.g. Migrate authentication gateway to OAuth 2.1"
            required
            error={errors.title?.message}
            {...register("title")}
          />

          <Textarea
            label="Description"
            placeholder="Add a more detailed description..."
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className={styles.row2}>
            <Select
              label="Status"
              error={errors.status?.message}
              options={(statuses || []).map((s) => ({
                value: s._id,
                label: s.name,
              }))}
              {...register("status")}
            />

            <Select
              label="Priority"
              error={errors.priority?.message}
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              {...register("priority")}
            />
          </div>

          <div className={styles.row2}>
            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register("dueDate")}
            />

            <Select
              label="Assignee"
              error={errors.assignedTo?.message}
              options={[
                { value: "", label: "Unassigned" },
                ...(users || []).map((u) => ({
                  value: u._id,
                  label: u.name,
                })),
              ]}
              {...register("assignedTo")}
            />
          </div>

          {/* Audit Metadata in Edit Mode */}
          {isEditing && taskToEdit && (
            <div className={styles.metadataSection}>
              {taskToEdit.createdBy && (
                <div className={styles.metadataItem}>
                  <span>Created by:</span>
                  <strong>{taskToEdit.createdBy.name}</strong>
                </div>
              )}
              {taskToEdit.createdAt && (
                <div className={styles.metadataItem}>
                  <span>Created:</span>
                  <strong>{formatDate(taskToEdit.createdAt)}</strong>
                </div>
              )}
              {taskToEdit.updatedAt && (
                <div className={styles.metadataItem}>
                  <span>Last updated:</span>
                  <strong>{formatDate(taskToEdit.updatedAt)}</strong>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && taskToEdit && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete '${taskToEdit.title}'? This action can be undone by an administrator.`}
          confirmLabel="Delete Task"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

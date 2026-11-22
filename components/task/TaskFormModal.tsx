"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Textarea, Select, useToast } from "@/components/ui";
import { createTaskSchema } from "@/lib/validations/taskSchema";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  TaskItem,
} from "@/store/services/tasksApi";
import { useGetStatusesQuery } from "@/store/services/statusesApi";
import { useGetUsersQuery } from "@/store/services/usersApi";
import { toInputDateFormat } from "@/lib/utils/dateUtils";
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

  const { data: statuses } = useGetStatusesQuery();
  const { data: users } = useGetUsersQuery({ isActive: true });

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
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
        toast.success(`Task '${data.title}' updated successfully.`);
      } else {
        await createTask({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          assignedTo: data.assignedTo || null,
        }).unwrap();
        toast.success(`Task '${data.title}' created successfully.`);
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
        form="task-modal-form"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isEditing ? "Save Changes" : "Create Task"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create Task"}
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
          placeholder="Add details, acceptance criteria, or technical notes..."
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
      </form>
    </Modal>
  );
}

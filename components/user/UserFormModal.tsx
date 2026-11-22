"use client";

import React, { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Select, useToast } from "@/components/ui";
import { createUserSchema } from "@/lib/validations/userSchema";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  UserItem,
} from "@/store/services/usersApi";
import styles from "./UserFormModal.module.scss";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserItem | null;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: "Product Manager", label: "Product Manager" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "Senior Engineer", label: "Senior Engineer" },
  { value: "Engineering Lead", label: "Engineering Lead" },
  { value: "Designer", label: "Designer" },
  { value: "QA Engineer", label: "QA Engineer" },
  { value: "Admin", label: "Admin" },
];

interface UserFormData {
  name: string;
  email: string;
  role?: string;
}

export default function UserFormModal({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
}: UserFormModalProps) {
  const isEditing = !!userToEdit;
  const toast = useToast();

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema) as unknown as Resolver<UserFormData>,
    defaultValues: {
      name: "",
      email: "",
      role: ROLE_OPTIONS[0].value,
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role || ROLE_OPTIONS[0].value,
      });
    } else {
      reset({
        name: "",
        email: "",
        role: ROLE_OPTIONS[0].value,
      });
    }
  }, [userToEdit, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && userToEdit) {
        await updateUser({
          id: userToEdit._id,
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
          },
        }).unwrap();
        toast.success(`User '${data.name}' updated successfully.`);
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          role: data.role,
        }).unwrap();
        toast.success(`User '${data.name}' created successfully.`);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(
        error.data?.error?.message ||
          `Failed to ${isEditing ? "update" : "invite"} user.`
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
        form="user-form"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isEditing ? "Save Changes" : "Send Invite"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Invite User"}
      footer={footer}
      maxWidth="480px"
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Full Name"
          placeholder="e.g. Alex Kim"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Corporate Email"
          type="email"
          placeholder="name@taskflow.io"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <Select
          label="Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register("role")}
        />
      </form>
    </Modal>
  );
}

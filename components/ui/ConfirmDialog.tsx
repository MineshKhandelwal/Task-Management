import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./ConfirmDialog.module.scss";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={variant === "danger" ? "danger" : "primary"}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth="480px"
    >
      <div className={styles.content}>
        {typeof message === "string" ? <p>{message}</p> : message}
      </div>
    </Modal>
  );
}

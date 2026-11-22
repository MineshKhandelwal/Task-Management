"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCreateTaskMutation } from "@/store/services/tasksApi";
import { useToast, Spinner } from "@/components/ui";
import styles from "./KanbanQuickAdd.module.scss";

interface KanbanQuickAddProps {
  statusId: string;
  onCreated?: () => void;
}

export default function KanbanQuickAdd({ statusId, onCreated }: KanbanQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const [createTask, { isLoading }] = useCreateTaskMutation();

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await createTask({
        title: trimmed,
        status: statusId,
        priority: "medium",
      }).unwrap();

      toast.success("Task created.");
      setTitle("");
      setIsOpen(false);
      onCreated?.();
    } catch {
      toast.error("Failed to create task.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setTitle("");
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen(true)}
      >
        <span className={`material-symbols-outlined ${styles.icon}`}>add</span>
        <span>Add a task</span>
      </button>
    );
  }

  return (
    <form className={styles.widget} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Enter task title..."
          rows={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className={styles.activeLine} />
      </div>

      <div className={styles.actionRow}>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? <Spinner size="sm" /> : "Create task"}
        </button>
        <button
          type="button"
          aria-label="Cancel"
          className={styles.cancelBtn}
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
          disabled={isLoading}
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>close</span>
        </button>
      </div>
    </form>
  );
}

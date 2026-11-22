"use client";

import React, { useState } from "react";
import { useCreateTaskMutation } from "@/store/services/tasksApi";
import { useToast } from "@/components/ui";
import styles from "./QuickAddTaskRow.module.scss";

export default function QuickAddTaskRow() {
  const [title, setTitle] = useState("");
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const toast = useToast();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      await submitTask();
    }
  };

  const submitTask = async () => {
    const trimmed = title.trim();
    if (!trimmed || isLoading) return;

    try {
      await createTask({
        title: trimmed,
      }).unwrap();

      setTitle("");
      toast.success(`Task '${trimmed}' created.`);
    } catch {
      toast.error("Failed to quickly create task.");
    }
  };

  return (
    <div className={styles.row}>
      <input
        type="text"
        className={styles.input}
        placeholder="+ Create a task (press Enter to save)..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-label="Quick create task"
      />
      {title.trim().length > 0 && (
        <button
          type="button"
          className={styles.submitBtn}
          onClick={submitTask}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Add"}
        </button>
      )}
    </div>
  );
}

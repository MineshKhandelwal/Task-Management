import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanCard from "@/components/kanban/KanbanCard";
import { TaskItem } from "@/store/services/tasksApi";

const mockTask: TaskItem = {
  _id: "6740b2f8e123456789abcdef",
  title: "Audit OAuth2 token refresh race condition",
  description: "Detailed description that should only be shown in details modal",
  status: {
    _id: "status-todo",
    name: "To Do",
    color: "#737687",
    isCompletion: false,
  },
  priority: "high",
  dueDate: "2026-12-31T00:00:00.000Z",
  assignedTo: {
    _id: "user-1",
    name: "Alex Kim",
    avatarColor: "#0f62fe",
  },
  createdBy: {
    _id: "user-1",
    name: "Alex Kim",
    avatarColor: "#0f62fe",
  },
  createdAt: "2026-11-20T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  deletedAt: null,
};

describe("KanbanCard component", () => {
  it("renders task title and task ID", () => {
    render(<KanbanCard task={mockTask} />);
    expect(screen.getByText("Audit OAuth2 token refresh race condition")).toBeInTheDocument();
    expect(screen.getByText("TASK-CDEF")).toBeInTheDocument();
  });

  it("does not render description on the card", () => {
    render(<KanbanCard task={mockTask} />);
    expect(
      screen.queryByText("Detailed description that should only be shown in details modal")
    ).not.toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const handleClick = vi.fn();
    render(<KanbanCard task={mockTask} onClick={handleClick} />);
    fireEvent.click(screen.getByText("Audit OAuth2 token refresh race condition"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

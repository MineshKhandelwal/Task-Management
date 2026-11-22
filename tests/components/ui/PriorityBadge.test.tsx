import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriorityBadge } from "@/components/ui";

describe("PriorityBadge component", () => {
  it("renders High priority correctly", () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders Medium priority correctly", () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders Low priority correctly", () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});

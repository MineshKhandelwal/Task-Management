import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/ui";

describe("StatusBadge component", () => {
  it("renders status name with color dot", () => {
    render(<StatusBadge name="In Progress" color="#0f62fe" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders custom status name", () => {
    render(<StatusBadge name="Completed" color="#006a68" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

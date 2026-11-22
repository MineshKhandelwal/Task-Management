import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "@/components/dashboard";

describe("StatCard component", () => {
  it("renders metric label and numeric value", () => {
    render(<StatCard label="Total Tasks" value={142} accentColor="#0f62fe" />);
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("renders with suffix when provided", () => {
    render(<StatCard label="% Done" value={68} suffix="%" accentColor="#006a68" />);
    expect(screen.getByText("% Done")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
  });
});

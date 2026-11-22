import React from "react";
import Badge from "./Badge";

export interface StatusBadgeProps {
  name: string;
  color?: string; // Custom hex color
  size?: "sm" | "lg";
  className?: string;
}

// Preset color maps from docs/04-ui-design.md
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "to do": { bg: "var(--color-surface-container-highest)", text: "var(--color-on-surface-variant)" },
  backlog: { bg: "var(--color-surface-container-highest)", text: "var(--color-on-surface-variant)" },
  "in progress": { bg: "var(--color-primary-fixed)", text: "var(--color-on-primary-fixed-variant)" },
  "in review": { bg: "var(--color-tertiary-fixed)", text: "var(--color-on-tertiary-fixed-variant)" },
  completed: { bg: "var(--color-secondary-fixed)", text: "var(--color-on-secondary-fixed-variant)" },
  done: { bg: "var(--color-secondary-fixed)", text: "var(--color-on-secondary-fixed-variant)" },
};

export default function StatusBadge({ name, color, size = "sm", className }: StatusBadgeProps) {
  const normalized = name.trim().toLowerCase();
  const preset = STATUS_COLORS[normalized];

  let bg = preset?.bg || "var(--color-surface-container-highest)";
  let text = preset?.text || "var(--color-on-surface)";

  // If custom color is provided and not one of the default preset classes
  if (color && !preset) {
    bg = color;
    // Auto-detect dark or light bg for high contrast
    text = "#ffffff";
  }

  return <Badge label={name} backgroundColor={bg} textColor={text} size={size} className={className} />;
}

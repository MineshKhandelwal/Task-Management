import React from "react";
import styles from "./Avatar.module.scss";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  inactive?: boolean;
  className?: string;
}

// Color palette extracted from screen HTML & DESIGN.md
const AVATAR_COLORS = [
  "#0f62fe", // primary-container
  "#006a68", // secondary
  "#2f3131", // inverse-surface
  "#9e3100", // tertiary
  "#004ccd", // primary
  "#00504e", // secondary variant
  "#832700", // tertiary variant
];

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function deriveAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function Avatar({
  name,
  size = "md",
  color,
  inactive = false,
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = inactive ? undefined : color || deriveAvatarColor(name);

  const classNames = [
    styles.avatar,
    styles[`size-${size}`],
    inactive ? styles.inactive : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

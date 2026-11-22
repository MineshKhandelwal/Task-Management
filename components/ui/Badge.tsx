import React, { HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  size?: "sm" | "lg";
}

export default function Badge({
  label,
  backgroundColor,
  textColor,
  size = "sm",
  style,
  className,
  ...props
}: BadgeProps) {
  const customStyles: React.CSSProperties = {
    ...style,
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(textColor ? { color: textColor } : {}),
  };

  const classNames = [
    styles.badge,
    size === "lg" ? styles["size-lg"] : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} style={customStyles} {...props}>
      {label}
    </span>
  );
}

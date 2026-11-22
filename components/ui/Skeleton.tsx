import React from "react";
import styles from "./Loading.module.scss";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius,
  className,
}: SkeletonProps) {
  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...(borderRadius ? { borderRadius } : {}),
  };

  return (
    <div
      className={`${styles.skeleton} ${className || ""}`}
      style={inlineStyles}
      aria-hidden="true"
    />
  );
}

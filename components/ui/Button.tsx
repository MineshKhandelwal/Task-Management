import React, { forwardRef, ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "md" | "sm" | "icon";
  icon?: string;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      isLoading || disabled ? styles.disabled : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classNames}
        {...props}
      >
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          icon &&
          iconPosition === "left" && (
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )
        )}
        {children}
        {!isLoading && icon && iconPosition === "right" && (
          <span
            className={`material-symbols-outlined ${styles.icon}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

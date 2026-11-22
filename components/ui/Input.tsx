import React, { forwardRef, InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const inputClasses = [
      styles.input,
      error ? styles.error : "",
      leftIcon ? styles.hasLeftIcon : "",
      rightIcon ? styles.hasRightIcon : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.fieldGroup}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span
              className={`material-symbols-outlined ${styles.leftIcon}`}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />
          {rightIcon && (
            <span
              className={`material-symbols-outlined ${styles.rightIcon}`}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
        {!error && helperText && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

import React, { forwardRef, TextareaHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const textareaClasses = [
      styles.textarea,
      error ? styles.error : "",
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
        <textarea ref={ref} id={inputId} className={textareaClasses} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
        {!error && helperText && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

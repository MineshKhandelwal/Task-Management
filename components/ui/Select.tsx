import React, { forwardRef, SelectHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const selectClasses = [
      styles.select,
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
        <select ref={ref} id={inputId} className={selectClasses} {...props}>
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className={styles.errorMessage}>{error}</span>}
        {!error && helperText && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

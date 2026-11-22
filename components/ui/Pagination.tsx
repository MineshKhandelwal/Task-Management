import React from "react";
import styles from "./Pagination.module.scss";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`${styles.pagination} ${className || ""}`}>
      <div className={styles.leftSection}>
        <span>Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={styles.select}
          aria-label="Select items per page"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className={styles.rangeText}>
          {from}–{to} of {total} items
        </span>
      </div>

      <div className={styles.rightSection} aria-label="Pagination controls">
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>
            chevron_left
          </span>
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.pageBtn} ${p === page ? styles.active : ""}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className={styles.pageBtn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

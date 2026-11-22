"use client";

import React from "react";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useGetStatusesQuery } from "@/store/services/statusesApi";
import { useGetUsersQuery } from "@/store/services/usersApi";
import styles from "./FilterBar.module.scss";

export default function FilterBar() {
  const { filters, setFilter, resetFilters } = useTaskFilters();
  const { data: statuses } = useGetStatusesQuery();
  const { data: users } = useGetUsersQuery({ isActive: "all" });

  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.assignedTo ||
    filters.createdBy ||
    filters.dueBefore ||
    filters.dueAfter
  );

  return (
    <div className={styles.filterBar}>
      {/* Search Input */}
      <div className={styles.searchBox}>
        <span
          className={`material-symbols-outlined ${styles.searchIcon}`}
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search..."
          value={filters.search || ""}
          onChange={(e) => setFilter("search", e.target.value || undefined)}
          aria-label="Search tasks"
        />
      </div>

      {/* Status Filter */}
      <div
        className={`${styles.selectWrapper} ${
          filters.status ? styles.activeFilter : ""
        }`}
      >
        <select
          className={styles.select}
          value={filters.status || "all"}
          onChange={(e) =>
            setFilter("status", e.target.value === "all" ? undefined : e.target.value)
          }
          aria-label="Filter by status"
        >
          <option value="all">Status: All</option>
          {(statuses || []).map((s) => (
            <option key={s._id} value={s._id}>
              Status: {s.name}
            </option>
          ))}
        </select>
        <span
          className={`material-symbols-outlined ${styles.arrowIcon}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>

      {/* Priority Filter */}
      <div
        className={`${styles.selectWrapper} ${
          filters.priority ? styles.activeFilter : ""
        }`}
      >
        <select
          className={styles.select}
          value={filters.priority || "all"}
          onChange={(e) =>
            setFilter(
              "priority",
              e.target.value === "all" ? undefined : e.target.value
            )
          }
          aria-label="Filter by priority"
        >
          <option value="all">Priority: All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span
          className={`material-symbols-outlined ${styles.arrowIcon}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>

      {/* Assignee Filter */}
      <div
        className={`${styles.selectWrapper} ${
          filters.assignedTo ? styles.activeFilter : ""
        }`}
      >
        <select
          className={styles.select}
          value={filters.assignedTo || "all"}
          onChange={(e) =>
            setFilter(
              "assignedTo",
              e.target.value === "all" ? undefined : e.target.value
            )
          }
          aria-label="Filter by assignee"
        >
          <option value="all">Assignee: All</option>
          <option value="unassigned">Unassigned</option>
          {(users || []).map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
        <span
          className={`material-symbols-outlined ${styles.arrowIcon}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={resetFilters}
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

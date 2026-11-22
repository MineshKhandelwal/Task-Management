"use client";

import { useUrlParams } from "./useUrlParams";
import { TaskFilterParams } from "@/store/services/tasksApi";
import { useCallback, useMemo } from "react";

export function useTaskFilters() {
  const { getParam, setParam, setParams, clearParams } = useUrlParams();

  const filters: TaskFilterParams = useMemo(() => {
    const page = getParam("page") ? Number(getParam("page")) : 1;
    const limit = getParam("limit") ? Number(getParam("limit")) : 10;
    const search = getParam("search") || undefined;
    const status = getParam("status") || undefined;
    const priority = (getParam("priority") as "low" | "medium" | "high") || undefined;
    const assignedTo = getParam("assignedTo") || undefined;
    const createdBy = getParam("createdBy") || undefined;
    const dueBefore = getParam("dueBefore") || undefined;
    const dueAfter = getParam("dueAfter") || undefined;
    const sortBy =
      (getParam("sortBy") as
        | "createdAt"
        | "updatedAt"
        | "dueDate"
        | "priority"
        | "title") || "createdAt";
    const sortOrder = (getParam("sortOrder") as "asc" | "desc") || "desc";

    return {
      page,
      limit,
      search,
      status,
      priority,
      assignedTo,
      createdBy,
      dueBefore,
      dueAfter,
      sortBy,
      sortOrder,
    };
  }, [getParam]);

  const setFilter = useCallback(
    (name: keyof TaskFilterParams, value: string | number | null | undefined) => {
      // Whenever a filter changes (except page), reset page back to 1
      if (name !== "page") {
        setParams({ [name]: value, page: 1 });
      } else {
        setParam(name, value !== undefined && value !== null ? String(value) : null);
      }
    },
    [setParam, setParams]
  );

  const setFilters = useCallback(
    (newFilters: Partial<TaskFilterParams>) => {
      setParams({ ...newFilters, page: newFilters.page ?? 1 });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
  };
}

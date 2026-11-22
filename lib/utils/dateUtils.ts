// Date utility helpers for TaskFlow

export function isOverdue(
  dueDate: Date | string | null | undefined,
  isCompletion = false
): boolean {
  if (!dueDate || isCompletion) return false;
  const dateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return dateObj.getTime() < Date.now();
}

export function defaultDueDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "—";

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function toInputDateFormat(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toISOString().split("T")[0];
}

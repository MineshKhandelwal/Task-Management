import { describe, it, expect } from "vitest";
import {
  isOverdue,
  defaultDueDate,
  formatDate,
  toInputDateFormat,
  formatRelativeTime,
} from "@/lib/utils/dateUtils";

describe("dateUtils", () => {
  describe("isOverdue", () => {
    it("returns true for a date in the past when not completed", () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isOverdue(past, false)).toBe(true);
    });

    it("returns false for a date in the future", () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isOverdue(future, false)).toBe(false);
    });

    it("returns false if isCompletion is true, even if date is in past", () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isOverdue(past, true)).toBe(false);
    });

    it("returns false if dueDate is null or undefined", () => {
      expect(isOverdue(null, false)).toBe(false);
      expect(isOverdue(undefined, false)).toBe(false);
    });
  });

  describe("defaultDueDate", () => {
    it("returns a date 7 days in the future from the provided date", () => {
      const base = new Date("2026-01-01T00:00:00.000Z");
      const result = defaultDueDate(base);
      const diffMs = result.getTime() - base.getTime();
      expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe("formatDate", () => {
    it("formats a valid date into MMM DD, YYYY", () => {
      const formatted = formatDate("2026-05-18T12:00:00.000Z");
      expect(formatted).toMatch(/May\s+\d{1,2},\s+2026/);
    });

    it("returns '—' for null, undefined, or invalid dates", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined)).toBe("—");
      expect(formatDate("invalid-date-string")).toBe("—");
    });
  });

  describe("toInputDateFormat", () => {
    it("formats a date to YYYY-MM-DD", () => {
      const result = toInputDateFormat(new Date("2026-11-22T08:00:00.000Z"));
      expect(result).toBe("2026-11-22");
    });

    it("returns empty string for null, undefined, or invalid dates", () => {
      expect(toInputDateFormat(null)).toBe("");
      expect(toInputDateFormat(undefined)).toBe("");
      expect(toInputDateFormat("invalid-date-string")).toBe("");
    });
  });

  describe("formatRelativeTime", () => {
    it("returns 'just now' for dates less than 60 seconds ago", () => {
      const now = new Date(Date.now() - 20 * 1000);
      expect(formatRelativeTime(now)).toBe("just now");
    });

    it("returns 'Xm ago' for minutes", () => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(formatRelativeTime(tenMinsAgo)).toBe("10m ago");
    });

    it("returns 'Xh ago' for hours", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
    });

    it("returns 'Xd ago' for days", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
    });

    it("returns '—' for null or undefined", () => {
      expect(formatRelativeTime(null)).toBe("—");
      expect(formatRelativeTime(undefined)).toBe("—");
    });
  });
});

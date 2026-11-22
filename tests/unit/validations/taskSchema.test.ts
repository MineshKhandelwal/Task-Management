import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema,
} from "@/lib/validations/taskSchema";

describe("taskSchema validations", () => {
  describe("createTaskSchema", () => {
    it("accepts valid task input", () => {
      const valid = {
        title: "Deploy API Gateway v2.4",
        description: "Migrate routing and rate limiting rules",
        status: "status-id-123",
        priority: "high" as const,
        dueDate: "2026-12-01",
      };
      const result = createTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const invalid = {
        title: "   ",
        priority: "medium",
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects title exceeding 200 characters", () => {
      const invalid = {
        title: "A".repeat(201),
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("defaults priority to medium when omitted", () => {
      const input = {
        title: "Fix responsive layout issue",
      };
      const parsed = createTaskSchema.parse(input);
      expect(parsed.priority).toBe("medium");
    });
  });

  describe("taskListQuerySchema", () => {
    it("provides defaults for pagination and sorting", () => {
      const parsed = taskListQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe("createdAt");
      expect(parsed.sortOrder).toBe("desc");
    });

    it("coerces string page and limit to numbers", () => {
      const parsed = taskListQuerySchema.parse({
        page: "3",
        limit: "25",
        priority: "high",
      });
      expect(parsed.page).toBe(3);
      expect(parsed.limit).toBe(25);
      expect(parsed.priority).toBe("high");
    });
  });
});

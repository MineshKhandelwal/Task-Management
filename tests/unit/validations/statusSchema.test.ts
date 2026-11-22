import { describe, it, expect } from "vitest";
import { createStatusSchema, updateStatusSchema } from "@/lib/validations/statusSchema";

describe("statusSchema validations", () => {
  describe("createStatusSchema", () => {
    it("accepts valid status input", () => {
      const valid = {
        name: "Testing",
        color: "#c84000",
        order: 3,
        isDefault: false,
        isCompletion: false,
      };
      const result = createStatusSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty status name", () => {
      const invalid = {
        name: "",
        color: "#c84000",
      };
      const result = createStatusSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid hex color", () => {
      const invalid = {
        name: "In Review",
        color: "orange",
      };
      const result = createStatusSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects negative order value", () => {
      const invalid = {
        name: "In Review",
        color: "#c84000",
        order: -1,
      };
      const result = createStatusSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("updateStatusSchema", () => {
    it("accepts partial updates", () => {
      const partial = {
        name: "Done (Verified)",
        isCompletion: true,
      };
      const result = updateStatusSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });
  });
});

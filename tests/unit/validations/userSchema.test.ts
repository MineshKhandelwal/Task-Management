import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema } from "@/lib/validations/userSchema";

describe("userSchema validations", () => {
  describe("createUserSchema", () => {
    it("accepts valid user input", () => {
      const valid = {
        name: "Jordan Lee",
        email: "jordan.lee@example.com",
        role: "Frontend Engineer",
        avatarColor: "#0f62fe",
      };
      const result = createUserSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const invalid = {
        name: "",
        email: "jordan.lee@example.com",
      };
      const result = createUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const invalid = {
        name: "Jordan Lee",
        email: "not-an-email",
      };
      const result = createUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid avatarColor hex format", () => {
      const invalid = {
        name: "Jordan Lee",
        email: "jordan.lee@example.com",
        avatarColor: "invalid-color",
      };
      const result = createUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("updateUserSchema", () => {
    it("accepts partial updates", () => {
      const partial = {
        role: "Senior Lead",
        isActive: false,
      };
      const result = updateUserSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });
  });
});

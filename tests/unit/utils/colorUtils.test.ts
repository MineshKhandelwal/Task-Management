import { describe, it, expect } from "vitest";
import {
  AVATAR_COLORS,
  deriveAvatarColor,
  isValidHexColor,
} from "@/lib/utils/colorUtils";
import { getInitials } from "@/components/ui/Avatar";

describe("colorUtils", () => {
  describe("deriveAvatarColor", () => {
    it("returns a color from AVATAR_COLORS", () => {
      const color = deriveAvatarColor("Alex Kim");
      expect(AVATAR_COLORS).toContain(color);
    });

    it("is deterministic for the same name", () => {
      const color1 = deriveAvatarColor("Elena Rostova");
      const color2 = deriveAvatarColor("Elena Rostova");
      expect(color1).toBe(color2);
    });

    it("returns default color for empty or invalid names", () => {
      expect(deriveAvatarColor("")).toBe(AVATAR_COLORS[0]);
      expect(deriveAvatarColor(null as unknown as string)).toBe(AVATAR_COLORS[0]);
    });
  });

  describe("isValidHexColor", () => {
    it("validates 6-digit hex colors", () => {
      expect(isValidHexColor("#0f62fe")).toBe(true);
      expect(isValidHexColor("#FFFFFF")).toBe(true);
      expect(isValidHexColor("#000000")).toBe(true);
    });

    it("validates 3-digit hex colors", () => {
      expect(isValidHexColor("#fff")).toBe(true);
      expect(isValidHexColor("#000")).toBe(true);
    });

    it("rejects invalid hex strings", () => {
      expect(isValidHexColor("0f62fe")).toBe(false);
      expect(isValidHexColor("#12345")).toBe(false);
      expect(isValidHexColor("#gggggg")).toBe(false);
      expect(isValidHexColor("blue")).toBe(false);
    });
  });

  describe("getInitials", () => {
    it("extracts two initials from first and last name", () => {
      expect(getInitials("Alex Kim")).toBe("AK");
      expect(getInitials("Marcus Vance")).toBe("MV");
    });

    it("extracts first two letters from single-word names", () => {
      expect(getInitials("Admin")).toBe("AD");
    });

    it("returns '?' for empty name", () => {
      expect(getInitials("")).toBe("?");
    });
  });
});

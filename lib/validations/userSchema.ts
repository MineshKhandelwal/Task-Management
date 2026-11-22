import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),
  role: z
    .string()
    .trim()
    .max(100, "Role cannot exceed 100 characters")
    .optional()
    .default(""),
  avatarColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters")
    .optional(),
  role: z
    .string()
    .trim()
    .max(100, "Role cannot exceed 100 characters")
    .optional(),
  avatarColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

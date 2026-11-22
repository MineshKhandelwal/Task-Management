import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createStatusSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Status name is required")
    .max(80, "Status name cannot exceed 80 characters"),
  color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Color must be a valid hex code (e.g. #0F62FE)"),
  order: z.number().int().min(0, "Order must be a positive integer").default(0),
  isDefault: z.boolean().optional().default(false),
  isCompletion: z.boolean().optional().default(false),
});

export const updateStatusSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Status name cannot be empty")
    .max(80, "Status name cannot exceed 80 characters")
    .optional(),
  color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Color must be a valid hex code (e.g. #0F62FE)")
    .optional(),
  order: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  isCompletion: z.boolean().optional(),
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

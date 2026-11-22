import { NextRequest } from "next/server";
import { UserService } from "@/lib/services/userService";
import { updateUserSchema } from "@/lib/validations/userSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse(user);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to fetch user", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid update data",
        400,
        parsed.error.issues
      );
    }

    const updated = await UserService.updateUser(id, parsed.data);
    if (!updated) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse(updated);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.code === "CONFLICT") {
      return errorResponse("CONFLICT", error.message, 409);
    }
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to update user", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await UserService.softDeleteUser(id);

    if (!deleted) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse({ message: "User deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to delete user", 500);
  }
}

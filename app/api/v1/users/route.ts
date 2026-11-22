import { NextRequest } from "next/server";
import { UserService } from "@/lib/services/userService";
import { createUserSchema } from "@/lib/validations/userSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");

    let isActiveFilter: boolean | "all" = "all";
    if (isActiveParam === "true") isActiveFilter = true;
    else if (isActiveParam === "false") isActiveFilter = false;

    const users = await UserService.listUsers(isActiveFilter);
    return successResponse(users);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to list users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid user data",
        400,
        parsed.error.issues
      );
    }

    const newUser = await UserService.createUser(parsed.data);
    return successResponse(newUser, 201);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.code === "CONFLICT") {
      return errorResponse("CONFLICT", error.message, 409);
    }
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to create user", 500);
  }
}

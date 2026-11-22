import { NextRequest } from "next/server";
import { TaskService } from "@/lib/services/taskService";
import { createTaskSchema, taskListQuerySchema } from "@/lib/validations/taskSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const parsedQuery = taskListQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid query parameters",
        400,
        parsedQuery.error.issues
      );
    }

    const result = await TaskService.listTasks(parsedQuery.data);

    return successResponse(result.tasks, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to list tasks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid task data",
        400,
        parsed.error.issues
      );
    }

    // Read X-User-Id header for createdBy simulation
    const createdByHeader = request.headers.get("x-user-id") || undefined;

    const task = await TaskService.createTask(parsed.data, createdByHeader);
    return successResponse(task, 201);
  } catch (err: unknown) {
    const error = err as Error & { code?: string; details?: unknown };
    if (error.code === "VALIDATION_ERROR") {
      return errorResponse("VALIDATION_ERROR", error.message, 400, error.details);
    }
    if (error.code === "BUSINESS_RULE_ERROR") {
      return errorResponse("BUSINESS_RULE_ERROR", error.message, 422, error.details);
    }
    if (error.code === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", error.message, 404);
    }
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to create task", 500);
  }
}

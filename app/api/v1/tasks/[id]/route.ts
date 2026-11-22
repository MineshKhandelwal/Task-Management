import { NextRequest } from "next/server";
import { TaskService } from "@/lib/services/taskService";
import { updateTaskSchema } from "@/lib/validations/taskSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await TaskService.getTaskById(id);

    if (!task) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse(task);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to fetch task", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid update data",
        400,
        parsed.error.issues
      );
    }

    const updated = await TaskService.updateTask(id, parsed.data);
    if (!updated) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse(updated);
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
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to update task", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await TaskService.softDeleteTask(id);

    if (!deleted) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse({ message: "Task deleted successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to delete task", 500);
  }
}

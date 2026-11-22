import { TaskService } from "@/lib/services/taskService";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET() {
  try {
    const stats = await TaskService.getDashboardStats();
    return successResponse(stats);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(
      "INTERNAL_ERROR",
      error.message || "Failed to fetch dashboard statistics",
      500
    );
  }
}

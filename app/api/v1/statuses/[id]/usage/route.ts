import { NextRequest } from "next/server";
import { StatusService } from "@/lib/services/statusService";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskCount = await StatusService.getStatusUsageCount(id);

    return successResponse({ taskCount });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to get status usage", 500);
  }
}

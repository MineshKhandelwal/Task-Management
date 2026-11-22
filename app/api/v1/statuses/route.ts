import { NextRequest } from "next/server";
import { StatusService } from "@/lib/services/statusService";
import { createStatusSchema } from "@/lib/validations/statusSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET() {
  try {
    const statuses = await StatusService.listStatuses();
    return successResponse(statuses);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to list statuses", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createStatusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid status data",
        400,
        parsed.error.issues
      );
    }

    const newStatus = await StatusService.createStatus(parsed.data);
    return successResponse(newStatus, 201);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to create status", 500);
  }
}

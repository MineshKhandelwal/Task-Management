import { NextRequest } from "next/server";
import { StatusService } from "@/lib/services/statusService";
import { updateStatusSchema } from "@/lib/validations/statusSchema";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const status = await StatusService.getStatusById(id);

    if (!status) {
      return errorResponse("NOT_FOUND", "Status not found", 404);
    }

    return successResponse(status);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to fetch status", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid update data",
        400,
        parsed.error.issues
      );
    }

    const updated = await StatusService.updateStatus(id, parsed.data);
    if (!updated) {
      return errorResponse("NOT_FOUND", "Status not found", 404);
    }

    return successResponse(updated);
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to update status", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reassignTo = searchParams.get("reassignTo") || undefined;

    const result = await StatusService.deleteStatus(id, reassignTo);
    return successResponse(result);
  } catch (err: unknown) {
    const error = err as Error & { code?: string; details?: unknown };
    if (error.code === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", error.message, 404);
    }
    if (error.code === "BUSINESS_RULE_ERROR") {
      return errorResponse("BUSINESS_RULE_ERROR", error.message, 422, error.details);
    }
    return errorResponse("INTERNAL_ERROR", error.message || "Failed to delete status", 500);
  }
}

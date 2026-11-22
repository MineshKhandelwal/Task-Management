import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_ERROR"
  | "INTERNAL_ERROR";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  status = 200,
  meta?: PaginationMeta
) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}

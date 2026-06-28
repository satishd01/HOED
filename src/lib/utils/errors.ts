/**
 * Application-wide error classes for structured error handling.
 * Each error class carries a status code and error code for API responses.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {}
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string = "Payload too large") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMITED");
  }
}

/**
 * Formats an AppError into a JSON-serializable API response.
 */
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      message: error.message,
      code: error.code,
      ...(error instanceof ValidationError && { errors: error.errors }),
    },
  };
}

/**
 * Wraps an async API handler with structured error handling.
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(formatErrorResponse(error), {
      status: error.statusCode,
    });
  }

  console.error("Unhandled error:", error);
  return Response.json(
    {
      error: {
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500 }
  );
}

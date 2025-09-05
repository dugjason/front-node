/**
 * Base Front SDK error. All SDK errors extend this class.
 */
export class FrontError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
    public readonly headers?: Headers,
  ) {
    super(message)
    this.name = "FrontError"
  }
}

/** 400 Bad Request */
export class FrontBadRequestError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontBadRequestError"
  }
}
/** 401 Unauthorized */
export class FrontUnauthorizedError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontUnauthorizedError"
  }
}
/** 403 Forbidden */
export class FrontForbiddenError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontForbiddenError"
  }
}
/** 404 Not Found */
export class FrontNotFoundError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontNotFoundError"
  }
}
/** 409 Conflict */
export class FrontConflictError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontConflictError"
  }
}
/** 422 Unprocessable Entity */
export class FrontUnprocessableEntityError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontUnprocessableEntityError"
  }
}
/** 429 Too Many Requests */
export class FrontRateLimitError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontRateLimitError"
  }
}
/** 5xx Server Error */
export class FrontServerError extends FrontError {
  constructor(...args: ConstructorParameters<typeof FrontError>) {
    super(...args)
    this.name = "FrontServerError"
  }
}

/**
 * Normalize unknown errors (thrown by fetch/generated client) into FrontError subclasses.
 *
 * - Preserves HTTP status and headers when available
 * - Attempts to read `message` and `code` from the thrown payload
 * - Maps common HTTP status codes to specific subclasses for easier matching
 *
 * @param error - The unknown error payload (string/object/Error)
 * @param response - The corresponding `Response`, if available
 * @returns A typed `FrontError` subclass
 */
export function mapToFrontError(
  error: unknown,
  response?: Response,
): FrontError {
  // error could be a string, object, or already an Error/FrontError
  if (error instanceof FrontError) return error

  console.log("error >", error)

  const status = response?.status
  const headers = response?.headers
  console.log("headers >", headers)

  const maybeObj = error as Record<string, unknown> | string | undefined
  const code =
    typeof maybeObj === "object" &&
    maybeObj &&
    typeof (maybeObj as { code?: unknown }).code === "string"
      ? ((maybeObj as { code?: string }).code as string)
      : undefined
  const message =
    typeof maybeObj === "object" &&
    maybeObj &&
    typeof (maybeObj as { message?: unknown }).message === "string"
      ? ((maybeObj as { message?: string }).message as string)
      : `HTTP ${status ?? "error"}`

  const ctor =
    status === 400
      ? FrontBadRequestError
      : status === 401
        ? FrontUnauthorizedError
        : status === 403
          ? FrontForbiddenError
          : status === 404
            ? FrontNotFoundError
            : status === 409
              ? FrontConflictError
              : status === 422
                ? FrontUnprocessableEntityError
                : status === 429
                  ? FrontRateLimitError
                  : status && status >= 500
                    ? FrontServerError
                    : FrontError

  console.log({ message, status, code, error, headers })
  return new ctor(message, status, code, error, headers)
}

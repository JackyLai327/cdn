import { logger } from "../lib/logger.js"
import { AppError } from "../lib/errors.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { type Request, type Response, type NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error("Unhandled error", {
    message: (err as Error)?.message,
    stack: (err as Error)?.stack,
  })

  const response = ApiResponse.error(message, statusCode);

  res.status(statusCode).json(response);
}

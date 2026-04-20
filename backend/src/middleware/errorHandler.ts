import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/appError";
import { NODE_ENV } from "../constants/env";
import { ERROR_MSG } from "../constants/errorMessage";

const isTest = NODE_ENV === "test";

// ======================
// ZOD ERROR
// ======================
const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });
};

// ======================
// APP ERROR
// ======================
const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

// ======================
// MONGO DUPLICATE KEY ERROR
// ======================
const handleDuplicateKeyError = (res: Response, error: any) => {
  /**
   * Contoh error Mongo:
   * {
   *   code: 11000,
   *   keyPattern: { email: 1 },
   *   keyValue: { email: 'test@mail.com' }
   * }
   */

  const field = Object.keys(error.keyValue || {})[0] || "field";
  const value = error.keyValue?.[field];

  return res.status(CONFLICT).json({
    message: `${field} already exists`,
    field,
    value,
  });
};

// ======================
// MAIN HANDLER
// ======================
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (!isTest) {
    console.log(`PATH: ${req.path}`, error);
  }

  // ZOD
  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  // APP ERROR
  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  // MONGO DUPLICATE (E11000)
  if (error?.code === 11000) {
    return handleDuplicateKeyError(res, error);
  }

  // FALLBACK
  return res.status(INTERNAL_SERVER_ERROR).json({
    message: ERROR_MSG.INTERNAL_SERVER_ERROR,
  });
};

export default errorHandler;

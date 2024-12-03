import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/appError";
import { NODE_ENV } from "../constants/env";

const handleZodError = (res: any, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return res.status(BAD_REQUEST).json({
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);
  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }
  if (error instanceof AppError) {
    return handleAppError(res, error);
  }
  return res.status(INTERNAL_SERVER_ERROR).send("Internal server error");
};

export default errorHandler;

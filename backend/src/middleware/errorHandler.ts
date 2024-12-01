import { ErrorRequestHandler } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import path from "path";

const handleZodError = (res: any, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`PATH: ${req.path}`, err);
  if (err instanceof z.ZodError) {
    return handleZodError(res, err);
  }
  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Eror");
};

export default errorHandler;

import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, res, req, next) => {
  console.log(`PATH: ${req.path}`, error);
  return res.status(200).send("Internal Server Eror");
};

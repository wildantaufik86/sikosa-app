import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import mongoose from "mongoose";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );
  // Validasi payload userId dan sessionId yang diharapkan adalah string
  if (
    typeof payload.userId === "string" &&
    typeof payload.sessionId === "string"
  ) {
    try {
      // Cast ke ObjectId jika valid
      req.userId = new mongoose.Types.ObjectId(payload.userId);
      req.sessionId = new mongoose.Types.ObjectId(payload.sessionId);
    } catch (err) {
      return res.status(UNAUTHORIZED).json({
        message: "Invalid ObjectId format in token",
      });
    }
  } else {
    return res.status(UNAUTHORIZED).json({
      message: "Invalid token payload",
    });
  }

  next();
};

export default authenticate;

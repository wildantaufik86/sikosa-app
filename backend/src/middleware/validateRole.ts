import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import AppError from "../utils/appError";

const validateRole = (requiredRole: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.userId);

      // ✅ user tidak ditemukan → 401
      appAssert(user, UNAUTHORIZED, "Access denied: User not found", AppErrorCode.InvalidRole);

      // ✅ role salah → 403
      appAssert(
        user.role === requiredRole,
        FORBIDDEN,
        `Access denied: User role is '${user.role}', required role is '${requiredRole}'`,
        AppErrorCode.InvalidRole
      );

      next();
    } catch (error) {
      // ✅ kalau AppError → teruskan ke global error handler
      if (error instanceof AppError) {
        return next(error);
      }

      // fallback (unexpected error)
      return res.status(UNAUTHORIZED).json({
        message: "Access denied",
        code: AppErrorCode.InvalidRole,
      });
    }
  };
};

export default validateRole;

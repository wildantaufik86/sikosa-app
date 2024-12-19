import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

const validateRole = (requiredRole: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      // console.log("Validating role for userId:", req.userId);

      // Ambil user berdasarkan req.userId
      const user = await UserModel.findById(req.userId);

      appAssert(
        user, // Pastikan user ditemukan
        UNAUTHORIZED,
        "Access denied: User not found",
        AppErrorCode.InvalidRole
      );

      appAssert(
        user.role === requiredRole, // Validasi role
        UNAUTHORIZED,
        `Access denied: User role is '${user.role}', required role is '${requiredRole}'`,
        AppErrorCode.InvalidRole
      );

      next();
    } catch (error) {
      console.error("Error validating role:", error);
      return res.status(UNAUTHORIZED).json({
        message: "Access denied: Unable to validate role",
        code: AppErrorCode.InvalidRole,
      });
    }
  };
};

export default validateRole;

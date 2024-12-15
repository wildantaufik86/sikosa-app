import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

const validateRole = (requiredRole: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      // Ambil user berdasarkan req.userId
      const user = await UserModel.findById(req.userId);

      // Pastikan user ditemukan dan memiliki role yang benar
      appAssert(
        user && user.role === requiredRole,
        UNAUTHORIZED,
        "Access denied: Invalid role",
        AppErrorCode.InvalidRole
      );

      next();
    } catch (error) {
      // Handle error jika terjadi masalah
      return res.status(UNAUTHORIZED).json({
        message: "Access denied: Unable to validate role",
        code: AppErrorCode.InvalidRole,
      });
    }
  };
};

export default validateRole;

import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { NODE_ENV } from "../constants/env";

const isTest = NODE_ENV === "test";

const validateRole = (requiredRole: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.userId);

      appAssert(user, UNAUTHORIZED, "Access denied: User not found", AppErrorCode.InvalidRole);

      appAssert(
        user.role === requiredRole,
        FORBIDDEN,
        `Access denied: User role is '${user.role}', required role is '${requiredRole}'`,
        AppErrorCode.InvalidRole
      );

      next();
    } catch (error) {
      return res.status(FORBIDDEN).json({
        message: "Access denied",
        code: AppErrorCode.InvalidRole,
      });
    }
  };
};

export default validateRole;

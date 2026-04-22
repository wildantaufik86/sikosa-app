import { RequestHandler } from "express";
import mongoose from "mongoose";
import UserModel from "../models/userModel";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

const validatePsychologistId: RequestHandler = async (req, res, next) => {
  try {
    const { psychologistId } = req.body;

    // 1. required
    if (!psychologistId) {
      return res.status(BAD_REQUEST).json({
        message: "Psychologist ID is required",
        code: AppErrorCode.InvalidPayload,
      });
    }

    // 2. format validation (🔥 FIX UTAMA)
    if (!mongoose.Types.ObjectId.isValid(psychologistId)) {
      return res.status(BAD_REQUEST).json({
        message: "Invalid psychologistId format",
        code: AppErrorCode.InvalidPayload,
      });
    }

    // 3. existence + role
    const user = await UserModel.findById(psychologistId);

    if (!user || user.role !== "psikolog") {
      return res.status(NOT_FOUND).json({
        message: "Psychologist not found",
        code: AppErrorCode.InvalidRole,
      });
    }

    next();
  } catch (error) {
    next(error); // 🔥 penting biar tidak timeout
  }
};

export default validatePsychologistId;

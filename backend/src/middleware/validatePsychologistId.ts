import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import { BAD_REQUEST } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

const validatePsychologistId: RequestHandler = async (req, res, next) => {
  const { psychologistId } = req.body;

  // Pastikan psychologistId ada
  if (!psychologistId) {
    return res.status(BAD_REQUEST).json({
      message: "Psychologist ID is required",
      code: AppErrorCode.InvalidPayload,
    });
  }

  // Validasi apakah psychologistId adalah psikolog
  const user = await UserModel.findById(psychologistId);
  if (!user || user.role !== "psikolog") {
    return res.status(BAD_REQUEST).json({
      message: "The selected user is not a psychologist",
      code: AppErrorCode.InvalidRole,
    });
  }

  next();
};

export default validatePsychologistId;

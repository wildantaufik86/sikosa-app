import { RequestHandler } from "express";
import { applyConsultation, updateConsultation, getPsychologistNotifications } from "../services/consultation.service";
import { CREATED, OK, BAD_REQUEST, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";

export const applyConsultationHandler: RequestHandler = async (req, res) => {
  const { psychologistId, message } = req.body;
  const userId = req.userId?.toString();

  appAssert(userId, UNAUTHORIZED, "Unauthorized");

  const result = await applyConsultation({
    userId,
    psychologistId,
    message,
    role: "mahasiswa",
  });

  res.status(CREATED).json({
    message: result.message,
    data: result.data,
  });
};

export const updateConsultationStatus: RequestHandler = async (req, res) => {
  const psychologistId = req.userId?.toString();
  const { id } = req.params;
  const { status } = req.body;

  appAssert(psychologistId, UNAUTHORIZED, "Unauthorized");

  const consultation = await updateConsultation({
    psychologistId,
    consultationId: id,
    status,
  });

  res.status(OK).json({
    status: "success",
    message: `Consultation ${status}`,
    data: consultation,
  });
};

export const getNotificationsForPsychologist: RequestHandler = async (req, res) => {
  const psychologistId = req.userId?.toString();

  appAssert(psychologistId, UNAUTHORIZED, "Unauthorized");

  try {
    const notifications = await getPsychologistNotifications(psychologistId);

    res.status(OK).json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(BAD_REQUEST).json({
      message: "Failed to fetch notifications",
    });
  }
};

import { RequestHandler } from "express";
import { ConsultationModel } from "../models/consultationModel";
import appAssert from "../utils/appAssert";
import { OK, BAD_REQUEST, CREATED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const applyConsultationHandler: RequestHandler = async (req, res) => {
  const { psychologistId, message } = req.body;
  const userId = req.userId; // Dari middleware authenticate

  // Validasi input
  appAssert(
    psychologistId && message,
    BAD_REQUEST,
    "Psychologist ID and message are required."
  );

  // Simpan data konsultasi
  const consultation = await ConsultationModel.create({
    userId,
    psychologistId,
    message,
  });

  res.status(CREATED).json({
    message: "Consultation request sent successfully.",
    data: consultation,
  });
};

export const updateConsultationStatus: RequestHandler = async (req, res) => {
  const psychologistId = req.userId; // Diambil dari middleware authenticate
  const { id } = req.params; // ID konsultasi dari URL params
  const { status } = req.body; // Status baru: accepted/rejected

  // Validasi status hanya bisa 'accepted' atau 'rejected'
  appAssert(
    ["accepted", "rejected"].includes(status),
    BAD_REQUEST,
    "Invalid status",
    AppErrorCode.InvalidPayload
  );

  // Cari data konsultasi di database berdasarkan ID
  const consultation = await ConsultationModel.findById(id);
  appAssert(
    consultation,
    BAD_REQUEST,
    "Consultation not found",
    AppErrorCode.UserNotFound
  );

  // Validasi apakah psikolog punya hak mengupdate permintaan ini
  appAssert(
    consultation.psychologistId.equals(psychologistId),
    BAD_REQUEST,
    "Unauthorized to update this consultation",
    AppErrorCode.InvalidUser
  );

  // Update status konsultasi
  consultation.status = status;
  await consultation.save();

  res.status(OK).json({
    message: `Consultation ${status}`,
    data: consultation,
  });
};

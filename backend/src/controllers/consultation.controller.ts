import { RequestHandler } from "express";
import { ConsultationModel } from "../models/consultationModel";
import appAssert from "../utils/appAssert";
import { OK, BAD_REQUEST, CREATED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import chatRoom from "../models/chatRoom";

export const applyConsultationHandler: RequestHandler = async (req, res) => {
  const { psychologistId, message } = req.body;
  const userId = req.userId; // Dari middleware authenticate

  // Validasi input
  appAssert(psychologistId && message, BAD_REQUEST, "Psychologist ID and message are required.");

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
  appAssert(["accepted", "rejected"].includes(status), BAD_REQUEST, "Invalid status", AppErrorCode.InvalidPayload);

  // Cari data konsultasi di database berdasarkan ID
  const consultation = await ConsultationModel.findById(id);
  appAssert(consultation, BAD_REQUEST, "Consultation not found", AppErrorCode.UserNotFound);

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

  // Jika status accepted, buat room chat
  if (status === "accepted") {
    const existingRoom = await chatRoom.findOne({
      consultationId: consultation._id,
    });

    if (!existingRoom) {
      await chatRoom.create({
        consultationId: consultation._id,
        participants: [consultation.userId, psychologistId],
      });
    }
  }

  res.status(OK).json({
    message: `Consultation ${status}`,
    data: consultation,
  });
};

export const getNotificationsForPsychologist: RequestHandler = async (req, res) => {
  const psychologistId = req.userId; // Diambil dari middleware authenticate

  try {
    // Find all consultations where the psychologist is assigned and the status is "pending" or "accepted"
    const consultations = await ConsultationModel.find({
      psychologistId,
      status: { $in: ["pending", "accepted"] },
    })
      .populate("userId", "email") // Populate with only the user's email for efficiency
      .exec();

    // Return consultations as notifications (with relevant message)
    const notifications = consultations.map((consultation) => ({
      consultationId: consultation._id,
      userId: consultation.userId._id,
      message: `Consultation request from ${consultation.userId} is ${consultation.status}`,
      status: consultation.status,
    }));

    res.status(200).json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to fetch notifications",
    });
  }
};

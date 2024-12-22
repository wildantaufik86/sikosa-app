import { RequestHandler } from "express";
import { ConsultationModel } from "../models/consultationModel";
import appAssert from "../utils/appAssert";
import { OK, BAD_REQUEST, CREATED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import chatRoom from "../models/chatRoom";
import mongoose from "mongoose";

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
  const psychologistId = req.userId;
  const { id } = req.params;
  const { status } = req.body;

  appAssert(["accepted", "rejected"].includes(status), BAD_REQUEST, "Invalid status", AppErrorCode.InvalidPayload);

  const consultation = await ConsultationModel.findById(id);
  appAssert(consultation, BAD_REQUEST, "Consultation not found", AppErrorCode.UserNotFound);

  appAssert(
    consultation.psychologistId.equals(psychologistId),
    BAD_REQUEST,
    "Unauthorized to update this consultation",
    AppErrorCode.InvalidUser
  );

  consultation.status = status;
  await consultation.save();

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
  const psychologistId = req.userId;

  try {
    const consultations = await ConsultationModel.find({
      psychologistId,
      status: { $in: ["pending", "accepted", "rejected"] },
    })
      .populate("userId", "profile fullname email")
      .exec();

    const notifications = consultations.map((consultation) => {
      const typedConsultation = consultation as {
        _id: mongoose.Types.ObjectId;
        userId: { _id: mongoose.Types.ObjectId; profile?: { fullname: string }; email: string };
        status: "pending" | "accepted" | "rejected";
        createdAt: Date;
      };

      return {
        consultationId: typedConsultation._id.toString(),
        user: {
          _id: typedConsultation.userId._id.toString(),
          fullname: typedConsultation.userId.profile?.fullname || "",
          email: typedConsultation.userId.email,
        },
        message: `Consultation request from ${typedConsultation.userId.profile?.fullname} is ${typedConsultation.status}`,
        status: typedConsultation.status,
        createdAt: typedConsultation.createdAt,
      };
    });

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

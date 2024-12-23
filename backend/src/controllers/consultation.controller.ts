import { RequestHandler } from "express";
import { ConsultationModel } from "../models/consultationModel";
import appAssert from "../utils/appAssert";
import { OK, BAD_REQUEST, CREATED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import chatRoom from "../models/chatRoom";
import mongoose from "mongoose";

// Handler for user sending consultation request
export const applyConsultationHandler: RequestHandler = async (req, res) => {
  const { psychologistId, message } = req.body;
  const userId = req.userId; // From authentication middleware

  // Validate input
  appAssert(psychologistId && message, BAD_REQUEST, "Psychologist ID and message are required.");

  // Create consultation with "inactive" room status
  const consultation = await ConsultationModel.create({
    userId,
    psychologistId,
    message,
    status: "pending", // Set initial consultation status as "pending"
  });

  // Create a room with "inactive" status
  const room = await chatRoom.create({
    consultationId: consultation._id,
    participants: [userId, psychologistId],
    status: "inactive", // Set room status as "inactive" initially
  });

  res.status(CREATED).json({
    message: "Consultation request sent successfully.",
    data: consultation,
    room: room,
  });
};

// Handler for psychologist accepting or rejecting the consultation
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

  // If the psychologist accepts the consultation, update room to "active"
  if (status === "accepted") {
    const room = await chatRoom.findOne({
      consultationId: consultation._id,
    });

    if (room && room.status === "inactive") {
      room.status = "active"; // Change room status to "active"
      await room.save();
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

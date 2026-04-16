import { ConsultationModel } from "../models/consultationModel";
import chatRoom from "../models/chatRoom";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import mongoose from "mongoose";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const applyConsultation = async ({
  userId,
  psychologistId,
  message,
  role,
}: {
  userId?: string;
  psychologistId: string;
  message: string;
  role?: string;
}) => {
  // CONS-MHS-01
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");

  // CONS-MHS-05
  appAssert(role === "mahasiswa", FORBIDDEN, "Only mahasiswa allowed");

  // CONS-MHS-02
  appAssert(psychologistId, BAD_REQUEST, "psychologistId is required");

  // CONS-MHS-03
  appAssert(mongoose.Types.ObjectId.isValid(psychologistId), BAD_REQUEST, "Invalid psychologistId format");

  // CONS-MHS-13
  appAssert(message && message.trim() !== "", BAD_REQUEST, "Message cannot be empty");

  // CONS-MHS-14
  appAssert(message.length <= 1000, 413, "Message too long");

  // CONS-MHS-04 (simulasi)
  const psychologistExists = await ConsultationModel.db
    .collection("users")
    .findOne({ _id: new mongoose.Types.ObjectId(psychologistId), role: "psikolog" });

  appAssert(psychologistExists, NOT_FOUND, "Psychologist not found");

  // CONS-MHS-06
  const existing = await ConsultationModel.findOne({
    userId,
    psychologistId,
    status: "pending",
  });

  appAssert(!existing, CONFLICT, "Consultation already exists");

  const consultation = await ConsultationModel.create({
    userId,
    psychologistId,
    message,
    status: "pending",
  });

  await chatRoom.create({
    consultationId: consultation._id,
    participants: [userId, psychologistId],
    status: "inactive",
  });

  // CONS-MHS-15
  return {
    statusCode: 201,
    message: "Consultation created",
    data: consultation,
  };
};

export const updateConsultation = async ({
  psychologistId,
  consultationId,
  status,
}: {
  psychologistId: string;
  consultationId: string;
  status: "accepted" | "rejected";
}) => {
  appAssert(psychologistId, UNAUTHORIZED, "Unauthorized access");

  appAssert(["accepted", "rejected"].includes(status), BAD_REQUEST, "Invalid status");

  appAssert(mongoose.Types.ObjectId.isValid(consultationId), BAD_REQUEST, "Invalid consultationId");

  const consultation = await ConsultationModel.findById(consultationId);

  appAssert(consultation, NOT_FOUND, "Consultation not found");

  // 🔥 FIX: harus 403, bukan 401
  appAssert(consultation.psychologistId.toString() === psychologistId, FORBIDDEN, "Access denied");

  // 🔥 FIX: validasi status pending
  appAssert(consultation.status === "pending", BAD_REQUEST, "Invalid consultation status");

  consultation.status = status;
  await consultation.save();

  if (status === "accepted") {
    const room = await chatRoom.findOne({
      consultationId: consultation._id,
    });

    if (room && room.status === "inactive") {
      room.status = "active";
      await room.save();
    }
  }

  return consultation;
};

export const getPsychologistNotifications = async (psychologistId: string) => {
  const consultations = await ConsultationModel.find({
    psychologistId,
    status: { $in: ["pending", "accepted", "rejected"] },
  })
    .populate("userId", "profile fullname email")
    .exec();

  return consultations.map((consultation: any) => ({
    consultationId: consultation._id.toString(),
    user: {
      _id: consultation.userId._id.toString(),
      fullname: consultation.userId.profile?.fullname || "",
      email: consultation.userId.email,
    },
    message: `Consultation request from ${consultation.userId.profile?.fullname} is ${consultation.status}`,
    status: consultation.status,
    createdAt: consultation.createdAt,
  }));
};

export const getConsultationList = async (userId?: string) => {
  // CONS-MHS-01
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");

  // CONS-MHS-16
  return await ConsultationModel.find({ userId });
};

export const getConsultationDetail = async ({ userId, consultationId }: { userId: string; consultationId: string }) => {
  // CONS-MHS-01
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");

  // CONS-MHS-08
  appAssert(mongoose.Types.ObjectId.isValid(consultationId), BAD_REQUEST, "Invalid consultationId");

  const consultation = await ConsultationModel.findById(consultationId);

  // CONS-MHS-09
  appAssert(consultation, NOT_FOUND, "Consultation not found");

  // CONS-MHS-07
  appAssert(consultation.userId.toString() === userId, FORBIDDEN, "Access denied");

  // CONS-MHS-17
  return consultation;
};

export const sendMessage = async ({
  userId,
  consultationId,
  message,
}: {
  userId?: string;
  consultationId: string;
  message: string;
}) => {
  // CONS-MHS-10
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");

  // CONS-MHS-08
  appAssert(mongoose.Types.ObjectId.isValid(consultationId), BAD_REQUEST, "Invalid consultationId");

  const consultation = await ConsultationModel.findById(consultationId);

  // CONS-MHS-09
  appAssert(consultation, NOT_FOUND, "Consultation not found");

  // CONS-MHS-07 + PSI-14
  appAssert(
    consultation.userId.toString() === userId || consultation.psychologistId.toString() === userId,
    FORBIDDEN,
    "Access denied"
  );

  // CONS-MHS-11 & 12
  appAssert(consultation.status === "accepted", FORBIDDEN, "Consultation not active");

  // CONS-MHS-13
  appAssert(message && message.trim() !== "", BAD_REQUEST, "Message cannot be empty");

  // CONS-MHS-14
  appAssert(message.length <= 1000, 413, "Message too long");

  const room = await chatRoom.findOne({ consultationId });

  appAssert(room, NOT_FOUND, "Chat room not found");

  room.messages.push({
    senderId: new mongoose.Types.ObjectId(userId),
    message,
    timestamp: new Date(),
  });

  await room.save();

  // CONS-MHS-18
  return {
    message: "Message sent",
  };
};

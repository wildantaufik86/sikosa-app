import { ConsultationModel } from "../models/consultationModel";
import chatRoom from "../models/chatRoom";
import appAssert from "../utils/appAssert";
import AppError from "../utils/appError";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/errorMessage";

type ConsultationStatus = "pending" | "accepted" | "rejected";
type ConsultationDecision = "accepted" | "rejected";

interface ApplyConsultationParams {
  userId?: string;
  psychologistId: string;
  message: string;
  role?: string;
}

interface UpdateConsultationParams {
  psychologistId: string;
  consultationId: string;
  status: ConsultationDecision;
}

interface SendMessageParams {
  userId?: string;
  consultationId: string;
  message: string;
}

type ChatActorRole = "mahasiswa" | "psikolog";

interface ChatContextParams {
  userId?: string;
  consultationId?: string;
  actorRole?: ChatActorRole;
  consultationErrorMessage?: string;
  chatRoomErrorMessage?: string;
  validateConsultationIdFormat?: boolean;
}

interface GetChatParams extends ChatContextParams {
  limit?: number;
}

const MAX_MESSAGE_LENGTH = 1000;
const INVALID_MESSAGE_CONTENT_REGEX = /<script\b|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/i;

const ensureConsultationId = (consultationId?: string, validateFormat = true) => {
  appAssert(consultationId, BAD_REQUEST, "Consultation ID required");
  appAssert(!validateFormat || mongoose.Types.ObjectId.isValid(consultationId), BAD_REQUEST, "Invalid consultation ID");
};

const ensureMessageContent = (message: string) => {
  appAssert(message !== undefined && message !== null, BAD_REQUEST, ERROR_MSG.EMPTY_MESSAGE);
  appAssert(message.trim() !== "", BAD_REQUEST, ERROR_MSG.EMPTY_MESSAGE);
  appAssert(message.length <= MAX_MESSAGE_LENGTH, 413, ERROR_MSG.MESSAGE_TOO_LONG);
  appAssert(!INVALID_MESSAGE_CONTENT_REGEX.test(message), BAD_REQUEST, "Invalid message content");
};

const buildInternalError = (message: string) => new AppError(INTERNAL_SERVER_ERROR, message);

const getConsultationById = async (consultationId: string, errorMessage: string) => {
  try {
    return await ConsultationModel.findById(consultationId);
  } catch (error) {
    throw buildInternalError(errorMessage);
  }
};

const getChatRoomByConsultationId = async (consultationId: string, errorMessage: string) => {
  try {
    return await chatRoom.findOne({ consultationId });
  } catch (error) {
    throw buildInternalError(errorMessage);
  }
};

const resolveChatAccess = async ({
  userId,
  consultationId,
  actorRole,
  consultationErrorMessage = "Internal server error",
  chatRoomErrorMessage = "Internal server error",
  validateConsultationIdFormat = actorRole !== undefined,
}: ChatContextParams) => {
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");

  ensureConsultationId(consultationId, validateConsultationIdFormat);

  const consultation = await getConsultationById(consultationId!, consultationErrorMessage);

  appAssert(consultation, NOT_FOUND, "Consultation not found");

  if (actorRole === "psikolog") {
    appAssert(consultation.psychologistId.toString() === userId, FORBIDDEN, "Not authorized for this consultation");
  }

  const room = await getChatRoomByConsultationId(consultationId!, chatRoomErrorMessage);

  appAssert(room, NOT_FOUND, "Chat room not found");

  const participants = room.participants?.map((participant) => participant.toString()) ?? [];
  const isParticipant =
    participants.length > 0
      ? participants.includes(userId)
      : consultation.userId.toString() === userId || consultation.psychologistId.toString() === userId;

  if (actorRole === "mahasiswa") {
    appAssert(isParticipant, FORBIDDEN, "User not part of chat room");
  } else if (actorRole === "psikolog") {
    appAssert(isParticipant, FORBIDDEN, "Access denied");
  } else {
    appAssert(isParticipant, FORBIDDEN, "Access denied");
  }

  return { consultation, room };
};

export const applyConsultation = async ({ userId, psychologistId, message, role }: ApplyConsultationParams) => {
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

export const updateConsultation = async ({ psychologistId, consultationId, status }: UpdateConsultationParams) => {
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
    status: { $in: ["pending", "accepted", "rejected"] as ConsultationStatus[] },
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

export const sendMessage = async ({ userId, consultationId, message }: SendMessageParams) => {
  const { consultation, room } = await resolveChatAccess({ userId, consultationId });

  appAssert(consultation.status === "accepted", BAD_REQUEST, "Consultation not active");
  ensureMessageContent(message);

  appAssert(room.status === "active", BAD_REQUEST, "Chat room is not active");

  const newMessage = {
    senderId: new mongoose.Types.ObjectId(userId),
    message,
    timestamp: new Date(),
  };

  room.messages.push(newMessage);

  try {
    await room.save();
  } catch (error) {
    throw buildInternalError("Failed to send message");
  }

  return {
    statusCode: OK,
    message: "Message sent",
    data: newMessage,
  };
};

export const sendMessageAsMahasiswa = async ({ userId, consultationId, message }: SendMessageParams) => {
  const { consultation, room } = await resolveChatAccess({ userId, consultationId, actorRole: "mahasiswa" });

  appAssert(consultation.status === "accepted", BAD_REQUEST, "Consultation not active");
  ensureMessageContent(message);
  appAssert(room.status === "active", BAD_REQUEST, "Chat room is not active");

  const newMessage = {
    senderId: new mongoose.Types.ObjectId(userId),
    message,
    timestamp: new Date(),
  };

  room.messages.push(newMessage);

  try {
    await room.save();
  } catch (error) {
    throw buildInternalError("Failed to send message");
  }

  return {
    statusCode: OK,
    message: "Message sent",
    data: newMessage,
  };
};

export const sendMessageAsPsychologist = async ({ userId, consultationId, message }: SendMessageParams) => {
  const { consultation, room } = await resolveChatAccess({ userId, consultationId, actorRole: "psikolog" });

  appAssert(consultation.status === "accepted", BAD_REQUEST, "Consultation not active");
  ensureMessageContent(message);
  appAssert(room.status === "active", BAD_REQUEST, "Chat room closed");

  const newMessage = {
    senderId: new mongoose.Types.ObjectId(userId),
    message,
    timestamp: new Date(),
  };

  room.messages.push(newMessage);

  try {
    await room.save();
  } catch (error) {
    throw buildInternalError("Failed to send message");
  }

  return {
    statusCode: OK,
    message: "Message sent",
    data: newMessage,
  };
};

export const getChat = async ({ userId, consultationId, actorRole, limit }: GetChatParams) => {
  appAssert(userId, UNAUTHORIZED, "Unauthorized access");
  ensureConsultationId(consultationId, false);

  const room = await getChatRoomByConsultationId(consultationId!, "Failed to fetch messages");

  appAssert(room, NOT_FOUND, "Chat room not found");

  const participants = room.participants?.map((participant) => participant.toString()) ?? [];
  appAssert(participants.includes(userId), FORBIDDEN, "Access denied");

  const sortedMessages = [...room.messages].sort((left, right) => {
    const leftTimestamp = new Date(left.timestamp ?? 0).getTime();
    const rightTimestamp = new Date(right.timestamp ?? 0).getTime();

    return leftTimestamp - rightTimestamp;
  });

  return {
    statusCode: OK,
    data: typeof limit === "number" && limit > 0 ? sortedMessages.slice(0, limit) : sortedMessages,
  };
};

export const getChatAsMahasiswa = async ({ userId, consultationId, limit }: Omit<GetChatParams, "actorRole">) =>
  getChat({ userId, consultationId, actorRole: "mahasiswa", limit });

export const getChatAsPsychologist = async ({ userId, consultationId, limit }: Omit<GetChatParams, "actorRole">) =>
  getChat({ userId, consultationId, actorRole: "psikolog", limit });

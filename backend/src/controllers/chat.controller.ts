import { RequestHandler, Request, Response } from "express";
import { BAD_REQUEST, CREATED, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import { buildOutgoingMessage, finishChatRoom, getChatRoomMessages, getChatRoomsForUser } from "../services/chat.service";
import { NODE_ENV } from "../constants/env";

const isTest = NODE_ENV === "test";

// Ambil semua room chat user
export const getUserChatRooms: RequestHandler = async (req, res) => {
  const userId = req.userId; // Dapatkan ID user dari middleware `authenticate`

  try {
    const chatRooms = await getChatRoomsForUser(userId?.toString());

    res.json(chatRooms);
  } catch (err) {
    console.error("Error fetching chat rooms:", err);
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch chat rooms" });
  }
};

// Ambil semua pesan dalam satu room
export const getRoomMessages: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await getChatRoomMessages(roomId);

    if (!room) {
      return res.status(NOT_FOUND).json({ error: "Chat room not found" });
    }

    const isParticipant = room.participants.some((p: any) => p.toString() === userId?.toString());

    if (!isParticipant) {
      return res.status(FORBIDDEN).json({ error: "Access denied" });
    }

    res.json(room.messages);
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const MAX_MESSAGE_LENGTH = 1000;
  const INVALID_MESSAGE_REGEX = /<script\b|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/i;

  try {
    const { roomId, senderId, message } = req.body;

    // =========================
    // 1. REQUIRED FIELD VALIDATION
    // =========================
    if (!roomId || !senderId || !message) {
      return res.status(BAD_REQUEST).json({
        error: "Missing required fields",
      });
    }

    // =========================
    // 2. EMPTY MESSAGE VALIDATION
    // =========================
    if (message.trim() === "") {
      return res.status(BAD_REQUEST).json({
        error: "Message cannot be empty",
      });
    }

    // =========================
    // 3. LENGTH VALIDATION (TC-015)
    // =========================
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(413).json({
        error: "Message too long",
      });
    }

    // =========================
    // 4. SCRIPT / INVALID CHAR VALIDATION (TC-016)
    // =========================
    if (INVALID_MESSAGE_REGEX.test(message)) {
      return res.status(BAD_REQUEST).json({
        error: "Invalid message content",
      });
    }

    // =========================
    // 5. BUILD MESSAGE
    // =========================
    const newMessage = buildOutgoingMessage({
      roomId,
      senderId,
      message,
    });

    // =========================
    // 6. DEBUG ONLY
    // =========================
    if (!isTest) {
      console.log("New Message:", newMessage);
    }

    return res.status(CREATED).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const updatedChatRoom = await finishChatRoom(roomId);

    if (!updatedChatRoom) {
      return res.status(NOT_FOUND).json({ message: "Chat room not found" });
    }

    res.status(OK).json({ message: "Chat finished", chatRoom: updatedChatRoom });
  } catch (error) {
    console.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to finish chat", error });
  }
};

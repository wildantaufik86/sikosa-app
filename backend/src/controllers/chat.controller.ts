import { RequestHandler, Request, Response } from "express";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import {
  buildOutgoingMessage,
  finishChatRoom,
  getChatRoomMessages,
  getChatRoomsForUser,
} from "../services/chat.service";

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

    const room = await getChatRoomMessages(roomId);

    if (!room) {
      return res.status(NOT_FOUND).json({ error: "Chat room not found" });
    }

    res.json(room.messages); // Kirim pesan ke client
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, senderId, message } = req.body;

    if (!roomId || !senderId || !message) {
      return res.status(BAD_REQUEST).json({ error: "Missing required fields" });
    }

    const newMessage = buildOutgoingMessage({
      roomId,
      senderId,
      message,
    });

    // Assuming Message.create is your database logic
    // Replace this with your actual implementation
    console.log("New Message:", newMessage); // Debugging

    res.status(CREATED).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
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

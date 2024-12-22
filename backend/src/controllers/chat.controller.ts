import { RequestHandler, Request, Response } from "express";
import chatRoom from "../models/chatRoom";
import { CREATED, INTERNAL_SERVER_ERROR } from "../constants/http";

// Ambil semua room chat user
export const getUserChatRooms: RequestHandler = async (req, res) => {
  const userId = req.userId; // Dapatkan ID user dari middleware `authenticate`

  try {
    // Cari chat rooms yang melibatkan user tersebut
    const chatRooms = await chatRoom
      .find({ participants: userId })
      .populate("participants", "email") // Ambil informasi email dari participant
      .sort({ updatedAt: -1 }); // Urutkan berdasarkan pembaruan terakhir

    res.json(chatRooms);
  } catch (err) {
    console.error("Error fetching chat rooms:", err);
    res.status(500).json({ message: "Failed to fetch chat rooms" });
  }
};

// Ambil semua pesan dalam satu room
export const getRoomMessages: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Cari chat room berdasarkan ID
    const room = await chatRoom
      .findById(roomId)
      .populate("participants", "name email") // Populate informasi peserta
      .populate("messages.senderId", "name email"); // Populate pengirim pesan

    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    res.json(room.messages); // Kirim pesan ke client
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, senderId, message } = req.body;

    if (!roomId || !senderId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Simulating saving to database
    const newMessage = {
      roomId,
      senderId,
      message,
      timestamp: new Date(),
    };

    // Assuming Message.create is your database logic
    // Replace this with your actual implementation
    console.log("New Message:", newMessage); // Debugging

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Perbarui status menjadi "inactive"
    const updatedChatRoom = await chatRoom.findByIdAndUpdate(
      roomId,
      { status: "inactive" },
      { new: true } // Mengembalikan dokumen yang diperbarui
    );

    if (!updatedChatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    res.status(200).json({ message: "Chat finished", chatRoom: updatedChatRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to finish chat", error });
  }
};

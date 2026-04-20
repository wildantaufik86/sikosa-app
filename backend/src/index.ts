import "dotenv/config";
import connectToDatabase from "./config/db";
import { NODE_ENV, PORT } from "./constants/env";

import { createServer } from "http";
import { Server } from "socket.io";
import chatRoom from "./models/chatRoom";
import app, { allowedOrigins } from "./app";

// Socket.IO Event Handlers
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle client joining room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    try {
      const chatRoomInstance = await chatRoom.findById(roomId);
      if (!chatRoomInstance) {
        socket.emit("error", { message: "Chat room not found." });
        return;
      }
      socket.join(roomId);
      console.log(`Client ${userId} joined room: ${roomId}`);
    } catch (error) {
      console.error("Error while joining room:", error);
      socket.emit("error", { message: "Failed to join room." });
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  // Handle incoming messages
  socket.on("sendMessage", async ({ roomId, senderId, message }) => {
    const timestamp = new Date();

    try {
      const chatRoomInstance = await chatRoom.findById(roomId);
      if (!chatRoomInstance) {
        socket.emit("error", { message: "Chat room not found." });
        return;
      }

      // Save the message to the chat room document
      chatRoomInstance.messages.push({ senderId, message, timestamp });
      await chatRoomInstance.save();

      // Emit the new message to all clients in the room
      io.to(roomId).emit("receiveMessage", { senderId, message, timestamp });
    } catch (error) {
      console.error("Error handling chat room messages:", error);
      socket.emit("error", { message: "Failed to save message." });
    }
  });

  // Handle client disconnecting
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on("roomUpdate", ({ roomId, status }) => {
    io.emit("roomUpdate", { _id: roomId, status });
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});

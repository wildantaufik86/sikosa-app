import "dotenv/config";
import express from "express";
import cors from "cors";
import connectToDatabase from "./config/db";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { APP_ORIGIN, FE_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import authenticate from "./middleware/authenticate";
import consultationRoutes from "./routes/psikolog.routes";
import path from "path";
import psikologRoutes from "./routes/psikolog.routes";
import articleRoutes from "./routes/article.routes";
import adminRoutes from "./routes/admin.routes";
import { createServer } from "http";
import { Server } from "socket.io";
import chatRoutes from "./routes/chat.routes";
import chatRoom from "./models/chatRoom";

const allowedOrigins = [
    // "https://wildantfq.my.id",
    "http://localhost:5173",
    "http://localhost:4173"
    // "http://sikosa.my.id",
    // "https://sikosa.my.id",
];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(cookieParser());

app.get("/api", ({ req, res }: any) => {
  return res.status(OK).json({
    status: "Connected!!!",
  });
});
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/admin", adminRoutes);

// general API
app.use("/api/articles", articleRoutes);


// api konsul
app.use("/api/consultation", consultationRoutes, userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/user", authenticate, userRoutes);
app.use("/api/psikolog", authenticate, psikologRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(errorHandler);

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

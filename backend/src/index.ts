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
import { Server } from "socket.io";
import chatRoutes from "./routes/chat.routes";
import chatRoom from "./models/chatRoom";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [APP_ORIGIN, FE_ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", ({ req, res }: any) => {
  return res.status(OK).json({
    status: "Connected!!!",
  });
});
app.use("/chat", authenticate, chatRoutes);
app.use("/admin", adminRoutes);

// general API
app.use("/api/v1", articleRoutes);

// api konsul
app.use("/consultation", consultationRoutes, userRoutes);

app.use("/auth", authRoutes);

app.use("/user", authenticate, userRoutes);
app.use("/psikolog", authenticate, psikologRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  const server = require("http").createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [APP_ORIGIN, FE_ORIGIN],
      methods: ["GET", "POST", "PATCH", "PUT"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId, userId }) => {
      try {
        const chatRoomInstance = await chatRoom.findById(roomId);
        if (!chatRoomInstance) {
          socket.emit("error", { message: "Chat room not found." });
          return;
        }
        socket.join(roomId);
      } catch (error) {
        socket.emit("error", { message: "Failed to join room." });
      }
    });

    socket.on("sendMessage", async ({ roomId, senderId, message }) => {
      const timestamp = new Date();
      try {
        const chatRoomInstance = await chatRoom.findById(roomId);
        if (!chatRoomInstance) {
          socket.emit("error", { message: "Chat room not found." });
          return;
        }
        chatRoomInstance.messages.push({ senderId, message, timestamp });
        await chatRoomInstance.save();
        io.to(roomId).emit("receiveMessage", { senderId, message, timestamp });
      } catch (error) {
        socket.emit("error", { message: "Failed to save message." });
      }
    });

    socket.on("roomUpdate", ({ roomId, status }) => {
      io.emit("roomUpdate", { _id: roomId, status });
    });
  });

  server.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  });
}
// erver.listen(PORT, async () => {
//   console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
//   await connectToDatabase();
// });

// export { handler };

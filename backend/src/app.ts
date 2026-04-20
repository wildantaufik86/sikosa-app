import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import authenticate from "./middleware/authenticate";
import consultationRoutes from "./routes/psikolog.routes";
import path from "path";
import psikologRoutes from "./routes/psikolog.routes";
import articleRoutes from "./routes/article.routes";
import adminRoutes from "./routes/admin.routes";
import chatRoutes from "./routes/chat.routes";
import chatbotRouter from "./routes/chatbot.routes";

const app = express();

export const allowedOrigins = [
  // "https://wildantfq.my.id",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://sikosa.my.id",
  "https://sikosa.my.id",
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/api", ({ req, res }: any) => {
  return res.status(OK).json({
    status: "Connected!!!",
  });
});

// chatbot
app.use("/api/chatbot", chatbotRouter);

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

export default app;

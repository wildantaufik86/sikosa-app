import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectToDatabase from "./config/db";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import catchErrors from "./utils/catchErrors";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import authenticate from "./middleware/authenticate";
import consultationRoutes from "./routes/psikolog.routes";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", ({ req, res }: any) => {
  return res.status(OK).json({
    status: "Connected!!!",
  });
});

// api konsul
app.use("/consultation", consultationRoutes);

app.use("/auth", authRoutes);

app.use("/user", authenticate, userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});

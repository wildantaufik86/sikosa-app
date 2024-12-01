import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectToDatabase from "./config/db";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import catchErrors from "./utils/catchErrors";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.routes";

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

app.get("/", ({ req, res, next }: any) => {
  return res.status(OK).json({
    status: "Connected!!!",
  });
});

app.use("/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});

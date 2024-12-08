import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import { CONFLICT } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/sessionModel";
import UserModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import appAssert from "../utils/appAssert";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken";

export type CreateAccountParams = {
  email: string;
  username: string;
  password: string;
  role?: "mahasiswa" | "dokter" | "admin";
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // Verify existing user
  const existingUser = await UserModel.exists({
    $or: [{ email: data.email }, { username: data.username }],
  });
  appAssert(!existingUser, CONFLICT, "Email or Username already in use");
  //   if (existingUser) {
  //     throw new Error("User already Exist");
  //   }
  // Create user
  const user = await UserModel.create({
    email: data.email,
    username: data.username,
    password: data.password,
    role: data.role || "mahasiswa",
  });
  const userId = user._id;

  // verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    { userId: user._id, sessionId: session._id, role: user.role },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

type LoginParams = {
  email: string;
  username: string;
  password: string;
  userAgent?: string;
};
export const loginUser = async ({
  email,
  username,
  userAgent,
}: LoginParams) => {};

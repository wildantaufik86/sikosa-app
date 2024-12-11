import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/sessionModel";
import UserModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import appAssert from "../utils/appAssert";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken";
import { refreshTokenSignOptions, signToken } from "../utils/jwt";

export type CreateAccountParams = {
  email: string;
  nim: string;
  password: string;
  profile?: {
    picture: string;
    fullname: string;
  };
  role?: "mahasiswa" | "dokter" | "admin";
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // Verify existing user
  const existingUser = await UserModel.exists({
    $or: [{ email: data.email }, { nim: data.nim }],
  });
  appAssert(!existingUser, CONFLICT, "Email or nim already in use");

  // Create user
  const user = await UserModel.create({
    email: data.email,
    nim: data.nim,
    profile: data.profile || { picture: "", fullname: "" },
    password: data.password,
    role: data.role || "mahasiswa",
  });
  const userId = user._id;

  // verification code
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // create session
  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });

  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    userId,
    sessionId: session._id,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};
export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  // get user by Email
  const user = await UserModel.findOne({
    email: email,
  });
  appAssert(user, UNAUTHORIZED, "Invalid Email or Password");

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid Email or Password");

  const userId = user._id;
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    userId,
    ...sessionInfo,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

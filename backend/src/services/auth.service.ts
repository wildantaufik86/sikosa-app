import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/sessionModel";
import UserModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import appAssert from "../utils/appAssert";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import jwt from "jsonwebtoken";
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";
import AppErrorCode from "../constants/appErrorCode";
import { ERROR_MSG } from "../constants/errorMessage";

export type CreateAccountParams = {
  email: string;
  nim?: string;
  password: string;
  profile?: {
    picture: string;
    fullname: string;
  };
  role?: "mahasiswa" | "psikolog" | "admin";
  userAgent?: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createAccount = async (data: any) => {
  // ===== EMAIL =====
  appAssert(data.email, BAD_REQUEST, "Email is required", AppErrorCode.InvalidPayload);

  if (!isValidEmail(data.email)) {
    appAssert(false, BAD_REQUEST, "Invalid email format", AppErrorCode.InvalidPayload);
  }

  const existingUser = await UserModel.exists({ email: data.email });
  if (existingUser) {
    appAssert(false, CONFLICT, "Email already exists", AppErrorCode.InvalidPayload);
  }

  // ===== NIM =====
  if (data.nim) {
    if (!/^\d+$/.test(data.nim)) {
      appAssert(false, BAD_REQUEST, "NIM must be numeric", AppErrorCode.InvalidPayload);
    }

    if (data.nim.length < 8 || data.nim.length > 15) {
      appAssert(false, BAD_REQUEST, "NIM length is invalid", AppErrorCode.InvalidPayload);
    }
  }

  // ===== PASSWORD =====
  appAssert(data.password, BAD_REQUEST, "Password is required", AppErrorCode.InvalidPayload);

  if (data.password.length < 8) {
    appAssert(false, BAD_REQUEST, "Password too short", AppErrorCode.InvalidPayload);
  }

  if (data.password.length > 32) {
    appAssert(false, BAD_REQUEST, "Password too long", AppErrorCode.InvalidPayload);
  }

  if (!/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) || !/[!@#$%^&*]/.test(data.password)) {
    appAssert(false, BAD_REQUEST, "Password must contain uppercase, number, and symbol", AppErrorCode.InvalidPayload);
  }

  // ===== PROFILE =====
  const profile = data.profile || {};
  const fullname = profile.fullname?.trim();
  let picture = profile.picture;

  appAssert(fullname, BAD_REQUEST, "Fullname is required", AppErrorCode.InvalidPayload);

  if (fullname.length < 2) {
    appAssert(false, BAD_REQUEST, "Fullname too short", AppErrorCode.InvalidPayload);
  }

  if (fullname.length > 50) {
    appAssert(false, BAD_REQUEST, "Fullname too long", AppErrorCode.InvalidPayload);
  }

  if (!/^[a-zA-Z\s]+$/.test(fullname)) {
    appAssert(false, BAD_REQUEST, "Fullname must contain only letters", AppErrorCode.InvalidPayload);
  }

  // ===== PICTURE (OPTIONAL) =====
  if (picture) {
    if (!isValidURL(picture)) {
      appAssert(false, BAD_REQUEST, "Invalid URL format", AppErrorCode.InvalidPayload);
    }

    if (!/\.(jpg|jpeg|png|webp)$/i.test(picture)) {
      appAssert(false, BAD_REQUEST, "Invalid image URL", AppErrorCode.InvalidPayload);
    }

    if (picture.length > 255) {
      appAssert(false, BAD_REQUEST, "URL too long", AppErrorCode.InvalidPayload);
    }
  } else {
    picture = null; // normalize
  }

  const normalizedProfile = {
    ...profile,
    fullname,
    picture,
  };

  // ===== ROLE =====
  appAssert(data.role, BAD_REQUEST, "Role is required", AppErrorCode.InvalidPayload);

  if (!["mahasiswa", "psikolog", "admin"].includes(data.role)) {
    appAssert(false, BAD_REQUEST, "Invalid role", AppErrorCode.InvalidRole);
  }

  // setelah validasi role
  if (data.role !== "mahasiswa") {
    appAssert(false, FORBIDDEN, ERROR_MSG.REGISTER_ROLE_FORBIDDEN);
  }

  // ===== CREATE USER =====
  const user = await UserModel.create({
    email: data.email,
    nim: data.nim,
    profile: normalizedProfile,
    password: data.password,
    role: data.role,
  });

  const userId = user._id;

  await VerificationCodeModel.create({
    userId,
    type: "email_verification",
    expiresAt: oneYearFromNow(),
  });

  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });

  const refreshToken = signToken({ sessionId: session._id });
  const accessToken = signToken({ userId, sessionId: session._id });

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

export const loginUser = async ({ email, password, userAgent }: LoginParams) => {
  // NORMALIZATION
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPassword = password?.trim();

  // VALIDATION
  appAssert(normalizedEmail || normalizedPassword, BAD_REQUEST, "Email and password are required", AppErrorCode.InvalidPayload);
  appAssert(normalizedEmail, BAD_REQUEST, "Email is required", AppErrorCode.InvalidPayload);
  appAssert(normalizedPassword, BAD_REQUEST, "Password is required", AppErrorCode.InvalidPayload);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  appAssert(emailRegex.test(normalizedEmail), BAD_REQUEST, "Invalid email format", AppErrorCode.InvalidPayload);

  // ======================
  // FIND USER
  // ======================
  const user = await UserModel.findOne({ email: normalizedEmail });

  appAssert(user, NOT_FOUND, "User not found", AppErrorCode.UserNotFound);

  // ======================
  // VERIFY ACCOUNT
  // ======================
  // appAssert(user.verified, FORBIDDEN, "Account not verified", AppErrorCode.InvalidUser);

  // ======================
  // PASSWORD CHECK
  // ======================
  const isValid = await user.comparePassword(normalizedPassword);

  appAssert(isValid, UNAUTHORIZED, "Invalid Email or Password", AppErrorCode.InvalidUser);

  // ======================
  // SESSION + TOKEN
  // ======================
  const session = await SessionModel.create({
    userId: user._id,
    userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    userId: user._id,
    ...sessionInfo,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(session && session.expiresAt.getTime() > now, UNAUTHORIZED, "Session expired");

  // refresh the session if it expires in the next 24hrs
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

type LogoutParams = {
  accessToken?: string;
};

export const logoutService = async ({ accessToken }: LogoutParams) => {
  // TC-LOGOUT-01: tanpa token
  appAssert(accessToken, UNAUTHORIZED, "Unauthorized");
  let payload: any;

  try {
    const result = verifyToken(accessToken, { throwOnError: true });
    payload = result.payload;
  } catch (error: any) {
    // TC-LOGOUT-03: expired
    if (error.name === "TokenExpiredError") {
      appAssert(false, UNAUTHORIZED, ERROR_MSG.TOKEN_EXPIRED);
    } else {
      appAssert(false, UNAUTHORIZED, ERROR_MSG.INVALID_TOKEN);
    }
  }
  // TC-LOGOUT-02 (fallback kalau payload null)
  appAssert(payload, UNAUTHORIZED, ERROR_MSG.INVALID_TOKEN);

  // hapus session (TC-LOGOUT-04 & 05)
  const deleted = await SessionModel.findByIdAndDelete(payload.sessionId);

  // TC-LOGOUT-05: token sudah tidak valid (session tidak ada)
  appAssert(deleted, UNAUTHORIZED, ERROR_MSG.INVALID_TOKEN);
  return {
    statusCode: OK,
    message: "Logout successful",
  };
};

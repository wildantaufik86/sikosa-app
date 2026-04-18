import mongoose from "mongoose";

import UserModel from "../models/userModel";
import { hashValue } from "../utils/bcrypt";
import { ConsultationModel } from "../models/consultationModel";

/**
 * =========================
 * GET USERS
 * =========================
 */
export const getAllUsers = async () => {
  return UserModel.find().lean();
};

export const getUserProfileById = async (id: string) => {
  return UserModel.findById(id).select("nim email profile").lean();
};

/**
 * =========================
 * CREATE USER
 * =========================
 */
export const createUserRecord = async ({
  email,
  password,
  role,
  nim = "",
  fullname,
  picture,
}: {
  email: string;
  password: string;
  role: string;
  nim?: string;
  fullname?: string;
  picture?: string;
}) => {
  const user = new UserModel({
    email,
    password,
    role,
    nim: nim.trim() || "",
    profile: {
      picture: picture || "",
      fullname: fullname || "",
    },
  });

  await user.save();
  return user.toObject();
};

/**
 * =========================
 * UPDATE USER
 * =========================
 */
export const updateUserRecord = async ({
  userId,
  email,
  password,
  role,
  fullname,
  description,
  educationBackground,
  specialization,
  nim,
  picture,
}: {
  userId: string;
  email?: string;
  password?: string;
  role?: string;
  fullname?: string;
  description?: string;
  educationBackground?: string[];
  specialization?: string;
  nim?: string;
  picture?: string;
}) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return null;
  }

  if (email) user.email = email;
  if (nim !== undefined) user.nim = nim;
  if (password) user.password = await hashValue(password);
  if (role) user.role = role as "mahasiswa" | "psikolog" | "admin";

  if (picture) user.profile.picture = picture;
  if (fullname) user.profile.fullname = fullname;
  if (description) user.profile.description = description;
  if (educationBackground) user.profile.educationBackground = educationBackground;
  if (specialization) user.profile.specialization = specialization;

  await user.save();

  const updatedUser = await UserModel.findById(userId).select("_id profile role nim").lean();

  return updatedUser;
};

/**
 * =========================
 * DELETE USER
 * =========================
 */
export const deleteUserRecord = async (userId: string) => {
  return UserModel.findByIdAndDelete(userId);
};

/**
 * =========================
 * CONSULTATION
 * =========================
 */

type PopulatedConsultation = {
  _id: mongoose.Types.ObjectId;
  psychologistId: {
    _id: mongoose.Types.ObjectId;
    profile?: { fullname?: string };
    email: string;
  };
  userId: {
    _id: mongoose.Types.ObjectId;
    profile?: { fullname?: string };
    email: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
};

export const getAllConsultationRecords = async () => {
  const consultations = await ConsultationModel.find()
    .populate({
      path: "psychologistId",
      select: "profile fullname email",
    })
    .populate({
      path: "userId",
      select: "profile fullname email",
    })
    .lean();

  return consultations.map((c: any) => {
    const typed = c as PopulatedConsultation;

    return {
      consultationId: typed._id.toString(),
      psychologist: {
        _id: typed.psychologistId._id.toString(),
        fullname: typed.psychologistId.profile?.fullname ?? "",
        email: typed.psychologistId.email,
      },
      user: {
        _id: typed.userId._id.toString(),
        fullname: typed.userId.profile?.fullname ?? "",
        email: typed.userId.email,
      },
      status: typed.status,
      createdAt: typed.createdAt,
    };
  });
};

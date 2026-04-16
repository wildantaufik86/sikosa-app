import mongoose from "mongoose";
import UserModel from "../models/userModel";
import { hashValue } from "../utils/bcrypt";
import { ConsultationModel } from "../models/consultationModel";

export const getAllUsers = () => UserModel.find();

export const getUserProfileById = (id: string) => UserModel.findById(id, "nim email profile");

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
  return user;
};

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
  if (nim) user.nim = nim;
  if (password) user.password = await hashValue(password);
  if (role) user.role = role as "mahasiswa" | "psikolog" | "admin";
  if (picture) user.profile.picture = picture;
  if (fullname) user.profile.fullname = fullname;
  if (description) user.profile.description = description;
  if (educationBackground) user.profile.educationBackground = educationBackground;
  if (specialization) user.profile.specialization = specialization;

  await user.save();

  return UserModel.findById(userId).select("_id profile role nim");
};

export const deleteUserRecord = (userId: string) => UserModel.findByIdAndDelete(userId);

type PopulatedConsultation = {
  _id: mongoose.Types.ObjectId;
  psychologistId: { _id: mongoose.Types.ObjectId; profile?: { fullname?: string }; email: string };
  userId: { _id: mongoose.Types.ObjectId; profile?: { fullname?: string }; email: string };
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
    .exec();

  return consultations.map((consultation) => {
    const typedConsultation = consultation as unknown as PopulatedConsultation;

    return {
      consultationId: typedConsultation._id.toString(),
      psychologist: {
        _id: typedConsultation.psychologistId._id.toString(),
        fullname: typedConsultation.psychologistId.profile?.fullname || "",
        email: typedConsultation.psychologistId.email,
      },
      user: {
        _id: typedConsultation.userId._id.toString(),
        fullname: typedConsultation.userId.profile?.fullname || "",
        email: typedConsultation.userId.email,
      },
      status: typedConsultation.status,
      createdAt: typedConsultation.createdAt,
    };
  });
};

import mongoose from "mongoose";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { BAD_REQUEST } from "../constants/http";
import { ConsultationModel } from "../models/consultationModel";
import { ERROR_MSG } from "../constants/errorMessage";

type PopulatedUserConsultation = {
  _id: mongoose.Types.ObjectId;
  psychologistId: { _id: mongoose.Types.ObjectId; profile?: { fullname?: string }; email?: string };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
};

export const updateUserProfile = async ({
  userId,
  nim,
  fullname,
  picture,
}: {
  userId?: mongoose.Types.ObjectId | string;
  nim?: string;
  fullname?: string;
  picture?: string;
}) => {
  appAssert(userId, BAD_REQUEST, ERROR_MSG.INVALID_USER, AppErrorCode.InvalidUser);

  const user = await UserModel.findById(userId);
  appAssert(user, BAD_REQUEST, ERROR_MSG.USER_NOT_FOUND, AppErrorCode.UserNotFound);

  if (nim) user.nim = nim;
  if (fullname) user.profile.fullname = fullname;
  if (picture) user.profile.picture = picture;

  await user.save();

  return {
    nim: user.nim,
    profile: {
      fullname: user.profile.fullname,
      picture: user.profile.picture,
    },
  };
};

export const getPsychologistProfile = (id: string) =>
  UserModel.findById(
    id,
    "id profile.fullname profile.description profile.educationBackground profile.specialization profile.picture"
  );

export const getAllPsychologistProfiles = async () => {
  const doctors = await UserModel.find(
    { role: "psikolog" },
    "_id profile.fullname profile.description profile.educationBackground profile.specialization profile.picture"
  );

  return doctors.map((doctor) => ({
    id: doctor._id,
    profile: {
      fullname: doctor.profile.fullname,
      description: doctor.profile.description,
      educationBackground: doctor.profile.educationBackground,
      specialization: doctor.profile.specialization,
      picture: doctor.profile.picture,
    },
  }));
};

export const getUserConsultationHistory = async (userId?: mongoose.Types.ObjectId | string) => {
  const consultations = await ConsultationModel.find({ userId })
    .populate({
      path: "psychologistId",
      select: "profile fullname email",
    })
    .exec();

  return consultations.map((consultation) => {
    const typedConsultation = consultation as unknown as PopulatedUserConsultation;

    return {
      consultationId: typedConsultation._id.toString(),
      psychologist: {
        _id: typedConsultation.psychologistId?._id?.toString() || "",
        fullname: typedConsultation.psychologistId?.profile?.fullname || "Unknown",
        email: typedConsultation.psychologistId?.email || "Unknown",
      },
      status: typedConsultation.status,
      createdAt: typedConsultation.createdAt,
    };
  });
};

import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const updatePsychologistProfile = async ({
  userId,
  fullname,
  description,
  specialization,
  educationBackground,
  picture,
}: {
  userId?: mongoose.Types.ObjectId | string;
  fullname?: string;
  description?: string;
  specialization?: string;
  educationBackground?: string[];
  picture?: string;
}) => {
  appAssert(userId, BAD_REQUEST, "Invalid user", AppErrorCode.InvalidUser);

  const user = await UserModel.findById(userId);
  appAssert(user, BAD_REQUEST, "User not found", AppErrorCode.UserNotFound);

  const oldProfilePicture = user.profile.picture;

  if (fullname) user.profile.fullname = fullname;
  if (picture) {
    user.profile.picture = picture;

    // Hapus file lama jika ada dan berbeda
    if (oldProfilePicture && oldProfilePicture !== picture) {
      try {
        const oldFilePath = path.join(__dirname, `../public${oldProfilePicture}`);
        // Cek file existence terlebih dahulu
        await fs.access(oldFilePath);
        await fs.unlink(oldFilePath);
      } catch (error: any) {
        // Hanya log jika error bukan karena file tidak ada
        if (error.code !== "ENOENT") {
          console.error("Gagal menghapus file lama:", error);
        }
        // Jika ENOENT (file not found), silent fail - tidak perlu di-log
      }
    }
  }

  if (description) user.profile.description = description;
  if (specialization) user.profile.specialization = specialization;
  if (educationBackground) {
    appAssert(Array.isArray(educationBackground), BAD_REQUEST, "Education background must be an array");
    user.profile.educationBackground = educationBackground;
  }

  await user.save();

  return {
    profile: {
      fullname: user.profile.fullname,
      picture: user.profile.picture,
      description: user.profile.description || "",
      specialization: user.profile.specialization || "",
      educationBackground: user.profile.educationBackground || [],
    },
  };
};

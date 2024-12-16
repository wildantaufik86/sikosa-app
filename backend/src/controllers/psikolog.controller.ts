import { RequestHandler } from "express";
import path from "path";
import fs from "fs/promises";
import { BAD_REQUEST, OK } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import appAssert from "../utils/appAssert";
import UserModel from "../models/userModel";

export const updatePsychologistProfileHandler: RequestHandler = async (
  req,
  res
) => {
  const userId = req.userId; // Middleware authenticate
  const { fullname, description, specialization, educationBackground } =
    req.body;

  // Handle upload file picture
  const picture = req.file
    ? `/uploads/${req.file.filename}` // Relative path untuk akses gambar
    : undefined;

  // Validasi input
  appAssert(userId, BAD_REQUEST, "Invalid user", AppErrorCode.InvalidUser);

  if (!fullname && !picture && !description && !educationBackground) {
    return res.status(BAD_REQUEST).json({
      message: "No valid fields to update",
    });
  }

  // Cari user berdasarkan userId
  const user = await UserModel.findById(userId);
  appAssert(user, BAD_REQUEST, "User not found", AppErrorCode.UserNotFound);

  // Simpan path foto profil lama sebelum update
  const oldProfilePicture = user.profile.picture;

  // Update fullname, picture, description, dan educationBackground jika tersedia
  if (fullname) user.profile.fullname = fullname;
  if (picture) {
    user.profile.picture = picture;

    // Hapus file lama jika ada
    if (oldProfilePicture && oldProfilePicture !== picture) {
      try {
        const oldFilePath = path.join(
          __dirname,
          `../public${oldProfilePicture}`
        );
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error("Gagal menghapus file lama:", error);
      }
    }
  }

  if (description) user.profile.description = description;
  if (specialization) user.profile.specialization = specialization;

  if (educationBackground) {
    // Pastikan educationBackground berbentuk array
    if (Array.isArray(educationBackground)) {
      user.profile.educationBackground = educationBackground;
    } else {
      return res.status(BAD_REQUEST).json({
        message: "Education background must be an array",
      });
    }
  }

  await user.save();

  // Kirim response
  res.status(OK).json({
    message: "Psychologist profile updated successfully",
    data: {
      email: user.email,
      nim: user.nim,
      role: user.role,
      verified: user.verified,
      profile: {
        fullname: user.profile.fullname,
        picture: user.profile.picture,
        description: user.profile.description || "",
        specialization: user.profile.specialization || "",
        educationBackground: user.profile.educationBackground || [],
      },
    },
  });
};

// import { NOT_FOUND, OK } from "../constants/http";
// import UserModel from "../models/userModel";
// import appAssert from "../utils/appAssert";
// import catchErrors from "../utils/catchErrors";

// export const getUserHandler = catchErrors(async (req, res) => {
//   const user = await UserModel.findById(req.userId);
//   appAssert(user, NOT_FOUND, "User not found");
//   return res.status(OK).json(user.omitPassword());
// });

import { RequestHandler } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, OK } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const updateUserProfileHandler: RequestHandler = async (req, res) => {
  const userId = req.userId; // Diambil dari middleware authenticate
  const { fullname } = req.body; // Mengupdate fullname
  const picture = req.file?.path; // Mengupdate picture jika ada file upload

  appAssert(userId, BAD_REQUEST, "Invalid user", AppErrorCode.InvalidUser);

  // Validasi input: Pastikan ada data yang diupdate
  if (!fullname && !picture) {
    return res.status(BAD_REQUEST).json({
      message: "No valid fields to update",
    });
  }

  // Cari user berdasarkan userId
  const user = await UserModel.findById(userId);
  appAssert(user, BAD_REQUEST, "User not found", AppErrorCode.UserNotFound);

  // Update fullname dan picture jika tersedia
  if (fullname) user.profile.fullname = fullname;
  if (picture) user.profile.picture = picture;

  await user.save();

  // Kirim response
  res.status(OK).json({
    message: "Profile updated successfully",
    data: {
      email: user.email,
      nim: user.nim,
      role: user.role,
      verified: user.verified,
      profile: user.profile, // Mengirim kembali fullname dan picture yang terbaru
    },
  });
};

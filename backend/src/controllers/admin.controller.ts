import { Request, Response } from "express";
import UserModel from "../models/userModel";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";

export const getUserProfileAll = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(OK).json({
      message: "Data semua user berhasil di dapatkan",
      data: users,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: "Terjadi kesalahan",
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userProfile = await UserModel.findById(id, "nim email profile");
    if (!userProfile) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }
    return res.status(OK).json({
      message: "Berhasil mendapatkan detail profile user",
      data: userProfile,
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to get detail profile" });
  }
};

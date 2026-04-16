import { Request, RequestHandler, Response } from "express";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import {
  createUserRecord,
  deleteUserRecord,
  getAllConsultationRecords,
  getAllUsers,
  getUserProfileById,
  updateUserRecord,
} from "../services/admin.service";

export const getUserProfileAll = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(OK).json({
      message: "Data semua user berhasil di dapatkan",
      data: users,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: "Terjadi kesalahan",
      error,
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userProfile = await getUserProfileById(id);
    if (!userProfile) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }
    return res.status(OK).json({
      message: "Berhasil mendapatkan detail profile user",
      data: userProfile,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to get detail profile", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await createUserRecord({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      nim: req.body.nim,
      fullname: req.body.fullname,
      picture: req.file ? `/uploads/${req.file.filename}` : "",
    });
    res.status(CREATED).json({ message: "Berhasil membuat user", data: newUser });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal Membuat User", error });
  }
};

export const userProfileEdit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, password, role, fullname, description, educationBackground, specialization, nim } = req.body;

  try {
    const updatedUser = await updateUserRecord({
      userId: id,
      email,
      password,
      role,
      fullname,
      description,
      educationBackground,
      specialization,
      nim,
      picture: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    if (!updatedUser) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }

    res.status(OK).json({ message: "Data user berhasil di update", data: updatedUser });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mengupdate data user", error });
  }
};

export const deleteProfileUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await deleteUserRecord(id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }

    res.status(OK).json({ message: "Berhasil menghapus user" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal menghapus user", error });
  }
};

export const getAllConsultations: RequestHandler = async (req, res) => {
  try {
    const formattedConsultations = await getAllConsultationRecords();

    res.status(OK).json({
      message: "Consultations fetched successfully",
      data: formattedConsultations,
    });
  } catch (error) {
    console.error(error);
    res.status(BAD_REQUEST).json({
      message: "Failed to fetch consultations",
    });
  }
};

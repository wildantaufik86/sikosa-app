import { RequestHandler, Request, Response } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import path from "path";
import { ConsultationModel } from "../models/consultationModel";
import mongoose from "mongoose";

export const updateUserProfileHandler: RequestHandler = async (req, res) => {
  const userId = req.userId;
  const { fullname } = req.body;
  const { nim } = req.body;

  const picture = req.file
    ? `/uploads/${req.file.filename}` // relative path untuk akses gambar
    : undefined;

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

  // Simpan path foto profil lama sebelum update
  const oldProfilePicture = user.profile.picture;

  // Update fullname dan picture jika tersedia
  if (nim) user.nim = nim;
  if (fullname) user.profile.fullname = fullname;
  if (picture) {
    user.profile.picture = picture;

    // Hapus file lama jika ada
    if (oldProfilePicture && oldProfilePicture !== picture) {
      try {
        const oldFilePath = path.join(__dirname, `../public${oldProfilePicture}`);
        // await fs.unlink(oldFilePath);
      } catch (error) {
        console.error("Gagal menghapus file lama:", error);
        // Lanjutkan proses meskipun gagal menghapus file
      }
    }
  }

  await user.save();

  // Kirim response
  res.status(OK).json({
    message: "Profile updated successfully",
    data: {
      nim: user.nim,
      profile: {
        fullname: user.profile.fullname,
        picture: user.profile.picture,
      },
    },
  });
};

// GET /user/doctor/:id
export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ambil data user dengan id tertentu dan hanya return id & fullname
    const doctorProfile = await UserModel.findById(
      id,
      "id profile.fullname profile.description profile.educationBackground profile.specialization profile.picture"
    );

    if (!doctorProfile) {
      return res.status(404).json({ message: "Dokter/Psikolog tidak ditemukan" });
    }

    return res.status(OK).json({
      message: "Detail Profil Psikolog",
      data: doctorProfile,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching doctor profile" });
  }
};

export const getAllPsychologist = async (req: Request, res: Response) => {
  try {
    // Query untuk mendapatkan semua user dengan role "psikolog"
    const doctors = await UserModel.find(
      { role: "psikolog" }, // Filter hanya untuk role "psikolog"
      "_id profile.fullname profile.description profile.educationBackground profile.specialization profile.picture" // Field yang dipilih
    );

    // Format data untuk respons
    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor._id,
      profile: {
        fullname: doctor.profile.fullname,
        description: doctor.profile.description,
        educationBackground: doctor.profile.educationBackground,
        specialization: doctor.profile.specialization,
        picture: doctor.profile.picture,
      },
    }));

    // Kirim respons ke klien
    return res.status(OK).json({
      message: "Doctors retrieved successfully",
      data: formattedDoctors,
    });
  } catch (error) {
    // Jika terjadi error, tangkap dan kirim respons error
    console.error("Error fetching doctors:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: "Failed to retrieve doctors",
    });
  }
};

// GET /user/chat/:id
export const getUserChat = async ({ req, res }: any) => {
  try {
    const { id } = req.params;
    // Ambil data chat berdasarkan id
    return res.status(OK).json({
      message: "Halaman chat",
      data: {
        /* Tambahkan data */
      },
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching chat data" });
  }
};

export const getConsultationsForUser: RequestHandler = async (req, res) => {
  const userId = req.userId; // Mengambil userId dari middleware authentication

  try {
    // Ambil semua konsultasi yang terkait dengan user
    const consultations = await ConsultationModel.find({ userId })
      .populate({
        path: "psychologistId",
        select: "profile fullname email", // Pastikan field yang dibutuhkan diambil
      })
      .exec();

    const formattedConsultations = consultations.map((consultation) => {
      const typedConsultation = consultation as unknown as {
        _id: mongoose.Types.ObjectId;
        psychologistId: { _id: mongoose.Types.ObjectId; profile?: { fullname: string }; email: string };
        status: "pending" | "accepted" | "rejected";
        createdAt: Date;
      };

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

    // Kirimkan data dalam respons
    res.status(200).json({
      message: "Consultations fetched successfully",
      data: formattedConsultations,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to fetch consultations",
    });
  }
};

// GET /user/consultation/history/:id
export const getUserConsultationDetail = async ({ req, res }: any) => {
  try {
    const { id } = req.params;
    return res.status(OK).json({
      message: "Detail konsultasi",
      data: {
        /* Tambahkan data */
      },
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching consultation detail" });
  }
};

import { RequestHandler, Request, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import {
  getAllPsychologistProfiles,
  getPsychologistProfile,
  getUserConsultationHistory,
  updateUserProfile,
} from "../services/user.service";
import appAssert from "../utils/appAssert";
import { getConsultationDetail } from "../services/consultation.service";

export const updateUserProfileHandler: RequestHandler = async (req, res) => {
  const userId = req.userId;
  const { fullname } = req.body;
  const { nim } = req.body;

  const picture = req.file
    ? `/uploads/${req.file.filename}` // relative path untuk akses gambar
    : undefined;

  if (!fullname && !picture && nim === undefined) {
    return res.status(BAD_REQUEST).json({
      message: "No valid fields to update",
    });
  }

  const profile = await updateUserProfile({
    userId,
    nim,
    fullname,
    picture,
  });

  res.status(OK).json({
    message: "Profile updated successfully",
    data: profile,
  });
};

// GET /user/doctor/:id
export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctorProfile = await getPsychologistProfile(id);

    if (!doctorProfile) {
      return res.status(NOT_FOUND).json({ message: "Dokter/Psikolog tidak ditemukan" });
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
    const formattedDoctors = await getAllPsychologistProfiles();

    // Kirim respons ke klien
    return res.status(OK).json({
      message: "Doctors retrieved successfully",
      data: formattedDoctors,
    });
  } catch (error) {
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
    const formattedConsultations = await getUserConsultationHistory(userId);

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

// GET /user/consultation/history/:id
export const getUserConsultationDetail: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId?.toString();

    // auth validation
    appAssert(userId, UNAUTHORIZED, "Unauthorized access");

    const consultation = await getConsultationDetail({
      userId,
      consultationId: id,
    });

    return res.status(OK).json({
      message: "Detail konsultasi",
      data: consultation,
    });
  } catch (error) {
    next(error); // 🔥 WAJIB biar tidak 500 & tidak timeout
  }
};

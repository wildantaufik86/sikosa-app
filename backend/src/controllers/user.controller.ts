import { RequestHandler, Request, Response } from "express";
import UserModel from "../models/userModel";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "../constants/http";
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

// GET /user/dashboard
export const getUserDashboard = async ({ req, res }: any) => {
  try {
    return res.status(OK).json({
      message: "User Dashboard",
      data: {
        /* Tambahkan data dashboard */
      },
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching dashboard data" });
  }
};

// GET /user/services
// export const getUserServices = async ({ req, res }: any) => {
//   try {
//     const services = await getUserServicesFromDB(); // Contoh pemanggilan service
//     return res.status(OK).json({ message: "Daftar layanan", data: services });
//   } catch (error) {
//     return res
//       .status(INTERNAL_SERVER_ERROR)
//       .json({ message: "Error fetching services" });
//   }
// };

// GET /user/services/:id
// export const getUserServiceDetail = async ({ req, res }: any) => {
//   try {
//     const { id } = req.params;
//     const serviceDetail = await getServiceDetailFromDB(id);
//     return res
//       .status(OK)
//       .json({ message: "Detail layanan", data: serviceDetail });
//   } catch (error) {
//     return res
//       .status(INTERNAL_SERVER_ERROR)
//       .json({ message: "Error fetching service detail" });
//   }
// };

// GET /user/doctor/:id
export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ambil data user dengan id tertentu dan hanya return id & fullname
    const doctorProfile = await UserModel.findById(id, "id profile.fullname");

    if (!doctorProfile) {
      return res
        .status(404)
        .json({ message: "Dokter/Psikolog tidak ditemukan" });
    }

    return res.status(OK).json({
      message: "Detail Profil Psikolog",
      data: doctorProfile,
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching doctor profile" });
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
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching chat data" });
  }
};

// GET /user/consultation/history
export const getUserConsultationHistory = async ({ req, res }: any) => {
  try {
    return res.status(OK).json({
      message: "Riwayat konsultasi",
      data: {
        /* Tambahkan data */
      },
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching consultation history" });
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
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching consultation detail" });
  }
};

// GET /user/articles
export const getUserArticles = async ({ req, res }: any) => {
  try {
    return res.status(OK).json({
      message: "Daftar artikel",
      data: {
        /* Tambahkan data artikel */
      },
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching articles" });
  }
};

// GET /user/articles/:id
export const getUserArticleDetail = async ({ req, res }: any) => {
  try {
    const { id } = req.params;
    return res.status(OK).json({
      message: "Detail artikel",
      data: {
        /* Tambahkan data */
      },
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching article detail" });
  }
};

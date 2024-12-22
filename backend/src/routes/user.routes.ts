import { Router } from "express";
import {
  updateUserProfileHandler,
  getDoctorProfile,
  getUserChat,
  getUserConsultationHistory,
  getUserConsultationDetail,
  getAllPsychologist,
} from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import validatePsychologistId from "../middleware/validatePsychologistId";
import { applyConsultationHandler } from "../controllers/consultation.controller";

const multer = require("multer");
import upload from "../middleware/upload";

const userRoutes = Router();

userRoutes.get("/psikolog/all", authenticate, validateRole("mahasiswa"), getAllPsychologist);

userRoutes.get("/psikolog/:id", authenticate, validateRole("mahasiswa"), getDoctorProfile);

// Chat
userRoutes.get("/chat/:id", authenticate, validateRole("mahasiswa"), getUserChat);

// Riwayat Konsultasi
userRoutes.get("/consultation/history", authenticate, validateRole("mahasiswa"), getUserConsultationHistory);
userRoutes.get("/consultation/history/:id", authenticate, validateRole("mahasiswa"), getUserConsultationDetail);

// Apply Consultation
userRoutes.post("/apply", authenticate, validateRole("mahasiswa"), validatePsychologistId, applyConsultationHandler);

// Update profile
userRoutes.put("/profile", authenticate, upload.single("picture"), validateRole("mahasiswa"), updateUserProfileHandler);

export default userRoutes;

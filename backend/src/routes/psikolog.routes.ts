import { Router } from "express";
import { getNotificationsForPsychologist, updateConsultationStatus } from "../controllers/consultation.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import upload from "../middleware/upload";
import { updatePsychologistProfileHandler } from "../controllers/psikolog.controller";
import { createArticle, deleteOwnArticle, updateOwnArticle } from "../controllers/article.controller";
import { asyncHandler } from "../utils/asyncHandler";

const multer = require("multer");
const psikologRoutes = Router();

psikologRoutes.get("/notifications", authenticate, validateRole("psikolog"), getNotificationsForPsychologist);

// accept pengajuan konsultasi
psikologRoutes.put("/:id/status", authenticate, validateRole("psikolog"), asyncHandler(updateConsultationStatus));

// edit profile
psikologRoutes.put(
  "/profile",
  authenticate,
  upload.single("picture"),
  validateRole("psikolog"),
  updatePsychologistProfileHandler
);

// create post
psikologRoutes.post("/articles", authenticate, validateRole("psikolog"), upload.single("thumbnail"), createArticle);

// edit post
psikologRoutes.put("/articles/:id", authenticate, validateRole("psikolog"), upload.single("thumbnail"), updateOwnArticle);

// delete post
psikologRoutes.delete("/articles/:id", authenticate, validateRole("psikolog"), deleteOwnArticle);
export default psikologRoutes;

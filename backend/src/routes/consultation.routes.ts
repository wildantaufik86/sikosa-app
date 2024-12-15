import { Router } from "express";
import {
  applyConsultationHandler,
  updateConsultationStatus,
} from "../controllers/consultation.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import validatePsychologistId from "../middleware/validatePsychologistId";

const router = Router();

router.post(
  "/apply",
  authenticate, // Middleware auth
  validateRole("mahasiswa"), // Memastikan role adalah mahasiswa
  validatePsychologistId, // Controller untuk handle apply konsultasi
  applyConsultationHandler
);

router.put(
  "/:id/status",
  authenticate,
  validateRole("psychologist"),
  updateConsultationStatus
);

export default router;

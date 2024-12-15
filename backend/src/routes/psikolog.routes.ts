import { Router } from "express";
import { updateConsultationStatus } from "../controllers/consultation.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";

const router = Router();

router.put(
  "/:id/status",
  authenticate,
  validateRole("psikolog"),
  updateConsultationStatus
);

export default router;

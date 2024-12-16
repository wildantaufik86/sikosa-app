import { Router } from "express";
import { updateConsultationStatus } from "../controllers/consultation.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import upload from "../middleware/upload";
import { updatePsychologistProfileHandler } from "../controllers/psikolog.controller";

const multer = require("multer");
// import upload from "../middleware/upload";

const psikologRoutes = Router();

psikologRoutes.put(
  "/:id/status",
  authenticate,
  validateRole("psikolog"),
  updateConsultationStatus
);

psikologRoutes.put(
  "/profile",
  authenticate,
  upload.single("picture"),
  validateRole("psikolog"),
  updatePsychologistProfileHandler
);

export default psikologRoutes;

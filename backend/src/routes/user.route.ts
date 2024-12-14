import { Router } from "express";
import { updateUserProfileHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const multer = require("multer"); // Require untuk menghindari masalah default export
const upload = multer({ dest: "uploads/" });

const userRoutes = Router();

userRoutes.put(
  "/profile",
  authenticate,
  upload.single("picture"),
  updateUserProfileHandler
);

export default userRoutes;

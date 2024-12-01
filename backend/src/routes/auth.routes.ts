import { Router } from "express";
import { registerHandler } from "../controllers/authController";

const authRoutes = Router();
authRoutes.post("/register", registerHandler);

export default authRoutes;

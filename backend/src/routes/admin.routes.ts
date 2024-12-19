import { Router } from "express";
import upload from "../middleware/upload";
import LogModel from "../models/logModel";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import {
  ArticleEdit,
  createArticle,
  createUser,
  deleteArticle,
  deleteProfileUser,
  getArticleAll,
  getArticleDetail,
  getUserProfile,
  getUserProfileAll,
  userProfileEdit,
} from "../controllers/admin.controller";

const adminRoutes = Router();

// Middleware untuk logging
const logAction = async ({ req, res, next }: any) => {
  const log = new LogModel({
    action: `${req.method} ${req.originalUrl}`,
    userId: req.userId,
  });
  await log.save();
  next();
};

// GET All Users
adminRoutes.get("/users/all", authenticate, validateRole("admin"), getUserProfileAll);

// GET User by Id
adminRoutes.get("/users/:id", authenticate, validateRole("admin"), getUserProfile);

// POST Membuat User
adminRoutes.post(
  "/users",
  authenticate,
  validateRole("admin"),
  upload.single("picture"),
  createUser
);

// PUT Update data User
adminRoutes.put(
  "/users/:id",
  authenticate,
  validateRole("admin"),
  upload.single("picture"),
  userProfileEdit
);

// DELETE User
adminRoutes.delete("/users/:id", authenticate, validateRole("admin"), deleteProfileUser);

// GET All artikel
adminRoutes.get("/articles", authenticate, validateRole("admin"), getArticleAll);

// GET artikel by Id
adminRoutes.get("/articles/:id", authenticate, validateRole("admin"), getArticleDetail);

// POST membuat artikel
adminRoutes.post(
  "/articles",
  authenticate,
  validateRole("admin"),
  upload.single("thumbnail"),
  createArticle
);

// PUT Update artikel
adminRoutes.put(
  "/articles/:id",
  authenticate,
  validateRole("admin"),
  upload.single("thumbnail"),
  ArticleEdit
);

// DELETE Menghapus artikel
adminRoutes.delete("/articles/:id", authenticate, validateRole("admin"), deleteArticle);

// View logs
adminRoutes.get("/logs", authenticate, validateRole("admin"), async (req, res) => {
  const logs = await LogModel.find().populate("userId", "profile.fullname");
  res.status(200).json({ data: logs });
});

export default adminRoutes;

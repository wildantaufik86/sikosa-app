import { Router } from "express";
import UserModel from "../models/userModel";
import ArticleModel from "../models/articleModel";
import LogModel from "../models/logModel";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import upload from "../middleware/upload";
import { hashValue } from "../utils/bcrypt";
import { CREATED, INTERNAL_SERVER_ERROR, OK } from "../constants/http";
import {
  getUserProfile,
  getUserProfileAll,
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
adminRoutes.get(
  "/users/all",
  authenticate,
  validateRole("admin"),
  getUserProfileAll
);

// GET User by Id
adminRoutes.get(
  "/users/:id",
  authenticate,
  validateRole("admin"),
  getUserProfile
);

adminRoutes.post(
  "/users",
  authenticate,
  validateRole("admin"),
  upload.single("picture"),
  async (req, res) => {
    const { email, password, role } = req.body;
    const newUser = new UserModel({
      email,
      password,
      role,
      profile: {
        picture: req.file ? `/uploads/${req.file.filename}` : "",
        fullname: req.body.fullname,
      },
    });

    try {
      await newUser.save();
      res.status(CREATED).json({ message: "User created", data: newUser });
    } catch (error) {
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to create user", error });
    }
  }
);

adminRoutes.put(
  "/users/:id",
  authenticate,
  validateRole("admin"),
  upload.single("picture"),
  async (req, res) => {
    const { id } = req.params;
    const {
      email,
      password,
      role,
      fullname,
      description,
      educationBackground,
      specialization,
      nim,
    } = req.body;

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (email) user.email = email;
      if (nim) user.nim = nim;
      if (password) user.password = await hashValue(password); // Ensure the password is hashed before saving
      if (role) user.role = role;
      if (req.file) user.profile.picture = `/uploads/${req.file.filename}`;
      if (fullname) user.profile.fullname = fullname;
      if (description) user.profile.description = description;
      if (educationBackground)
        user.profile.educationBackground = educationBackground;
      if (specialization) user.profile.specialization = specialization;

      await user.save();

      const updatedUser = await UserModel.findById(id).select(
        "_id profile role nim"
      );

      res.status(200).json({ message: "User updated", data: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error });
    }
  }
);

adminRoutes.delete(
  "/users/:id",
  authenticate,
  validateRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  }
);

// CRUD Articles
adminRoutes.get(
  "/articles",
  authenticate,
  validateRole("admin"),
  async (req, res) => {
    const articles = await ArticleModel.find().populate(
      "writer",
      "profile.fullname"
    );
    res.status(200).json({ data: articles });
  }
);

adminRoutes.post(
  "/articles",
  authenticate,
  validateRole("admin"),
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const thumbnail = req.file ? `/uploads/${req.file.filename}` : "";
      const slug = title.toLowerCase().replace(/ /g, "-");

      const newArticle = new ArticleModel({
        writer: req.userId,
        thumbnail,
        title,
        content,
        slug,
      });

      await newArticle.save();
      // Populate writer field
      const articleWithWriter = await ArticleModel.findById(
        newArticle._id
      ).populate({
        path: "writer",
        select: "_id profile.fullname",
      });

      res.status(201).json({
        message: "Article published",
        data: formatArticle(articleWithWriter),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to publish article", error });
    }
  }
);

adminRoutes.put(
  "/articles/:id",
  authenticate,
  validateRole("admin"),
  upload.single("thumbnail"),
  async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
      const article = await ArticleModel.findById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (title) {
        article.title = title;
        article.slug = title.toLowerCase().replace(/ /g, "-");
      }
      if (content) article.content = content;
      if (req.file) article.thumbnail = `/uploads/${req.file.filename}`;

      await article.save();
      res.status(200).json({ message: "Article updated", data: article });
    } catch (error) {
      res.status(500).json({ message: "Failed to update article", error });
    }
  }
);

adminRoutes.delete(
  "/articles/:id",
  authenticate,
  validateRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const article = await ArticleModel.findByIdAndDelete(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.status(200).json({ message: "Article deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article", error });
    }
  }
);

// View logs
adminRoutes.get(
  "/logs",
  authenticate,
  validateRole("admin"),
  async (req, res) => {
    const logs = await LogModel.find().populate("userId", "profile.fullname");
    res.status(200).json({ data: logs });
  }
);

function formatArticle(article: any) {
  if (!article) return null;
  const { _id, title, content, thumbnail, slug, writer, createdAt, updatedAt } =
    article;
  return {
    id: _id,
    title,
    content,
    thumbnail,
    slug,
    writer: {
      id: writer._id,
      fullname: writer.profile?.fullname || "Unknown",
    },
    createdAt,
    updatedAt,
  };
}

export default adminRoutes;

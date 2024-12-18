import { Router } from "express";
import { updateConsultationStatus } from "../controllers/consultation.controller";
import authenticate from "../middleware/authenticate";
import validateRole from "../middleware/validateRole";
import upload from "../middleware/upload";
import { updatePsychologistProfileHandler } from "../controllers/psikolog.controller";
import ArticleModel from "../models/articleModel";

const multer = require("multer");
const psikologRoutes = Router();

// accept pengajuan konsultasi
psikologRoutes.put(
  "/:id/status",
  authenticate,
  validateRole("psikolog"),
  updateConsultationStatus
);

// edit profile
psikologRoutes.put(
  "/profile",
  authenticate,
  upload.single("picture"),
  validateRole("psikolog"),
  updatePsychologistProfileHandler
);

// create post
psikologRoutes.post(
  "/articles",
  authenticate,
  validateRole("psikolog"),
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

// edit post
psikologRoutes.put(
  "/articles/:id",
  authenticate,
  validateRole("psikolog"),
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      const article = await ArticleModel.findOne({
        _id: id,
        writer_id: req.userId,
      });
      if (!article) {
        return res
          .status(403)
          .json({ message: "Unauthorized to edit this article" });
      }

      if (title) {
        article.title = title;
        article.slug = title.toLowerCase().replace(/ /g, "-");
      }
      if (content) article.content = content;
      if (req.file) article.thumbnail = `/uploads/${req.file.filename}`;

      await article.save();

      // Populate writer field
      const updatedArticle = await ArticleModel.findById(article._id).populate({
        path: "writer",
        select: "_id profile.fullname",
      });

      res.status(200).json({
        message: "Article updated",
        data: formatArticle(updatedArticle),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update article", error });
    }
  }
);

// delete post
psikologRoutes.delete(
  "/articles/:id",
  authenticate,
  validateRole("psikolog"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const article = await ArticleModel.findOneAndDelete({
        _id: id,
        writer_id: req.userId,
      });

      if (!article) {
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this article" });
      }

      res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article", error });
    }
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
export default psikologRoutes;

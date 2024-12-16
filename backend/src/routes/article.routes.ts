import express from "express";
import ArticleModel from "../models/articleModel";

const articleRoutes = express.Router();

// GET semua artikel (Publik)
articleRoutes.get("/articles", async (req, res) => {
  try {
    const articles = await ArticleModel.find().select("-content");
    res.status(200).json({ message: "Success", data: articles });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles", error });
  }
});

// GET artikel berdasarkan slug (Publik)
articleRoutes.get("/articles/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await ArticleModel.findOne({ slug });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "Success", data: article });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article", error });
  }
});

export default articleRoutes;

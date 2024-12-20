import express from "express";
import ArticleModel from "../models/articleModel";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";

const articleRoutes = express.Router();

// GET semua artikel (Publik)
articleRoutes.get("/articles", async (req, res) => {
  try {
    const articles = await ArticleModel.find().populate("writer", "profile.fullname");
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Gagal mendapatkan data artikel", error });
  }
});

articleRoutes.get("/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const articles = await ArticleModel.findById(id).populate("writer", "profile.fullname");
    if (!articles) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Gagal mendapatkan data artikel", INTERNAL_SERVER_ERROR });
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

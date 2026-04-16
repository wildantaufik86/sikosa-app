import { Request, Response } from "express";
import { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import {
  createArticleRecord,
  deleteArticleRecord,
  deleteOwnedArticleRecord,
  formatArticle,
  getAllArticles,
  getArticleById,
  updateArticleRecord,
  updateOwnedArticleRecord,
} from "../services/article.service";

export const getArticleAll = async (req: Request, res: Response) => {
  try {
    const articles = await getAllArticles();
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mendapatkan data artikel", error });
  }
};

export const getArticleDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const articles = await getArticleById(id);
    if (!articles) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mendapatkan data artikel", INTERNAL_SERVER_ERROR });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const articleWithWriter = await createArticleRecord({
      writer: req.userId,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : "",
      title: req.body.title,
      content: req.body.content,
    });

    res.status(CREATED).json({
      message: "Article published",
      data: formatArticle(articleWithWriter as any),
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to publish article", error });
  }
};

export const ArticleEdit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const article = await updateArticleRecord({
      articleId: id,
      title,
      content,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    res.status(OK).json({ message: "Article updated", data: article });
  } catch (error: any) {
    if (error?.message === "Artikel tidak ditemukan") {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }

    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mengupdate artikel", error });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const article = await deleteArticleRecord(id);
    if (!article) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }

    res.status(OK).json({ message: "Artikel berhasil di hapus" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal menghapus artikel", error });
  }
};

export const updateOwnArticle = async (req: Request, res: Response) => {
  try {
    const updatedArticle = await updateOwnedArticleRecord({
      articleId: req.params.id,
      writerId: req.userId,
      title: req.body.title,
      content: req.body.content,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    res.status(OK).json({
      message: "Article updated",
      data: formatArticle(updatedArticle as any),
    });
  } catch (error: any) {
    if (error?.message === "Unauthorized to edit this article") {
      return res.status(UNAUTHORIZED).json({ message: "Unauthorized to edit this article" });
    }

    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to update article", error });
  }
};

export const deleteOwnArticle = async (req: Request, res: Response) => {
  try {
    const article = await deleteOwnedArticleRecord({
      articleId: req.params.id,
      writerId: req.userId,
    });

    if (!article) {
      return res.status(UNAUTHORIZED).json({ message: "Unauthorized to delete this article" });
    }

    res.status(OK).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to delete article", error });
  }
};

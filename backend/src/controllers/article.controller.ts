import { NextFunction, Request, Response } from "express";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
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
import appAssert from "../utils/appAssert";
import { ERROR_MSG } from "../constants/errorMessage";
import mongoose from "mongoose";

export const getArticleAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await getAllArticles();

    res.status(OK).json({
      message: "Data artikel berhasil didapatkan",
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    appAssert(mongoose.Types.ObjectId.isValid(req.params.id), BAD_REQUEST, "Id article invalid");

    const article = await getArticleById(req.params.id);

    appAssert(article, NOT_FOUND, ERROR_MSG.ARTICLE_NOT_FOUND);

    res.status(OK).json({
      message: "Data artikel berhasil didapatkan",
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    appAssert(req.userId, UNAUTHORIZED, ERROR_MSG.UNAUTHORIZED);
    appAssert(req.body.title, BAD_REQUEST, "TITLE BAD REQUEST");
    appAssert(req.body.content, BAD_REQUEST, "CONTENT BAD REQUEST");

    const article = await createArticleRecord({
      writer: req.userId,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : "",
      title: req.body.title,
      content: req.body.content,
    });

    res.status(CREATED).json({
      message: "Artikel berhasil dibuat",
      data: formatArticle(article as any),
    });
  } catch (error) {
    next(error);
  }
};

export const ArticleEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await updateArticleRecord({
      articleId: req.params.id,
      title: req.body.title,
      content: req.body.content,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    res.status(OK).json({
      message: "Artikel berhasil diperbarui",
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteArticleRecord(req.params.id);

    res.status(OK).json({
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

export const updateOwnArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    appAssert(mongoose.Types.ObjectId.isValid(req.params.id), BAD_REQUEST, "Id article tidak valid");
    appAssert(req.userId, UNAUTHORIZED, ERROR_MSG.UNAUTHORIZED);

    const updatedArticle = await updateOwnedArticleRecord({
      articleId: req.params.id,
      writerId: req.userId,
      title: req.body.title,
      content: req.body.content,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    appAssert(updatedArticle, NOT_FOUND, ERROR_MSG.ARTICLE_NOT_FOUND);

    res.status(OK).json({
      message: "Article updated",
      data: formatArticle(updatedArticle as any),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOwnArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    appAssert(mongoose.Types.ObjectId.isValid(req.params.id), BAD_REQUEST, "Id article tidak valid");
    appAssert(req.userId, UNAUTHORIZED, ERROR_MSG.UNAUTHORIZED);

    const deleted = await deleteOwnedArticleRecord({
      articleId: req.params.id,
      writerId: req.userId,
    });

    appAssert(deleted, NOT_FOUND, ERROR_MSG.ARTICLE_NOT_FOUND);

    res.status(OK).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

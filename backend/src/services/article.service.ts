import mongoose, { Types } from "mongoose";
import ArticleModel from "../models/articleModel";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, CONFLICT } from "../constants/http";

// =========================
// TYPES
// =========================
type ArticleWriter = {
  _id: mongoose.Types.ObjectId | string;
  profile?: {
    fullname?: string;
  };
};

type FormattableArticle = {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  writer: ArticleWriter;
  createdAt: Date;
  updatedAt: Date;
};

// =========================
// HELPERS
// =========================
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// slug production-grade
const buildSlug = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special char
    .replace(/\s+/g, "-") // normalize space
    .replace(/-+/g, "-"); // normalize dash

const validateRequired = (value: any, message: string) => {
  appAssert(value !== undefined && value !== null, BAD_REQUEST, message);
};

// =========================
// FORMAT
// =========================
export const formatArticle = (article: FormattableArticle | null) => {
  if (!article) return null;

  return {
    id: article._id,
    title: article.title,
    content: article.content,
    thumbnail: article.thumbnail,
    slug: article.slug,
    writer: {
      id: article.writer?._id,
      fullname: article.writer?.profile?.fullname || "Unknown",
    },
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
};

// =========================
// GET
// =========================
export const getAllArticles = async () => {
  const data = await ArticleModel.find().populate("writer", "_id profile.fullname");
  return data;
};

export const getArticleById = async (id: string) => {
  appAssert(isValidObjectId(id), BAD_REQUEST, "ID tidak valid");

  const article = await ArticleModel.findById(id);
  appAssert(article, NOT_FOUND, "Artikel tidak ditemukan");

  return article;
};

// =========================
// CREATE
// =========================
export const createArticleRecord = async ({
  writer,
  title,
  content,
  thumbnail,
}: {
  writer: mongoose.Types.ObjectId | string | undefined;
  title: string;
  content: string;
  thumbnail?: string;
}) => {
  validateRequired(writer, "Writer wajib diisi");
  validateRequired(title, "Title wajib diisi");
  validateRequired(content, "Content wajib diisi");

  const cleanTitle = title.trim();
  appAssert(cleanTitle.length > 0, BAD_REQUEST, "Title tidak boleh kosong");

  const slug = buildSlug(cleanTitle);

  // optional: prevent duplicate slug
  const existing = await ArticleModel.findOne({ slug });
  appAssert(!existing, CONFLICT, "Slug sudah digunakan");

  const article = new ArticleModel({
    writer,
    thumbnail: thumbnail || "",
    title: cleanTitle,
    content,
    slug,
  });

  await article.save();

  return ArticleModel.findById(article._id).populate({
    path: "writer",
    select: "_id profile.fullname",
  });
};

// =========================
// UPDATE
// =========================
export const updateArticleRecord = async ({
  articleId,
  title,
  content,
  thumbnail,
}: {
  articleId: string;
  title?: string;
  content?: string;
  thumbnail?: string;
}) => {
  appAssert(isValidObjectId(articleId), BAD_REQUEST, "ID tidak valid");

  const article = await ArticleModel.findById(articleId);
  appAssert(article, NOT_FOUND, "Artikel tidak ditemukan");

  if (title !== undefined) {
    const cleanTitle = title.trim();
    appAssert(cleanTitle.length > 0, BAD_REQUEST, "Title tidak boleh kosong");

    article.title = cleanTitle;
    article.slug = buildSlug(cleanTitle);
  }

  if (content !== undefined) {
    article.content = content;
  }

  if (thumbnail !== undefined) {
    article.thumbnail = thumbnail;
  }

  await article.save();
  return article;
};

// =========================
// UPDATE OWNED
// =========================
export const updateOwnedArticleRecord = async ({
  articleId,
  writerId,
  title,
  content,
  thumbnail,
}: {
  articleId: string;
  writerId: mongoose.Types.ObjectId | string | undefined;
  title?: string;
  content?: string;
  thumbnail?: string;
}) => {
  appAssert(isValidObjectId(articleId), BAD_REQUEST, "ID tidak valid");

  const article = await ArticleModel.findOne({
    _id: articleId,
    writer: writerId,
  });

  appAssert(article, UNAUTHORIZED, "Unauthorized to edit this article");

  if (title !== undefined) {
    const cleanTitle = title.trim();
    appAssert(cleanTitle.length > 0, BAD_REQUEST, "Title tidak boleh kosong");

    article.title = cleanTitle;
    article.slug = buildSlug(cleanTitle);
  }

  if (content !== undefined) article.content = content;
  if (thumbnail !== undefined) article.thumbnail = thumbnail;

  await article.save();

  return ArticleModel.findById(article._id).populate({
    path: "writer",
    select: "_id profile.fullname",
  });
};

// =========================
// DELETE
// =========================
export const deleteArticleRecord = async (articleId: string) => {
  appAssert(isValidObjectId(articleId), BAD_REQUEST, "ID tidak valid");

  const deleted = await ArticleModel.findByIdAndDelete(articleId);
  appAssert(deleted, NOT_FOUND, "Artikel tidak ditemukan");

  return deleted;
};

export const deleteOwnedArticleRecord = async ({
  articleId,
  writerId,
}: {
  articleId: string;
  writerId: mongoose.Types.ObjectId | string | undefined;
}) => {
  appAssert(isValidObjectId(articleId), BAD_REQUEST, "ID tidak valid");

  const deleted = await ArticleModel.findOneAndDelete({
    _id: articleId,
    writer: writerId,
  });

  appAssert(deleted, UNAUTHORIZED, "Unauthorized to delete this article");

  return deleted;
};

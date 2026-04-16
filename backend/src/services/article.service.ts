import mongoose from "mongoose";
import ArticleModel from "../models/articleModel";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, UNAUTHORIZED } from "../constants/http";

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

const buildSlug = (title: string) => title.toLowerCase().replace(/ /g, "-");

export const formatArticle = (article: FormattableArticle | null) => {
  if (!article) return null;

  return {
    id: article._id,
    title: article.title,
    content: article.content,
    thumbnail: article.thumbnail,
    slug: article.slug,
    writer: {
      id: article.writer._id,
      fullname: article.writer.profile?.fullname || "Unknown",
    },
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
};

export const getAllArticles = () => ArticleModel.find().populate("writer", "profile.fullname");

export const getArticleById = (id: string) => ArticleModel.findById(id);

export const createArticleRecord = async ({
  writer,
  title,
  content,
  thumbnail,
}: {
  writer: mongoose.Types.ObjectId | string | undefined;
  title: string;
  content: string;
  thumbnail: string;
}) => {
  const article = new ArticleModel({
    writer,
    thumbnail,
    title,
    content,
    slug: buildSlug(title),
  });

  await article.save();

  return ArticleModel.findById(article._id).populate({
    path: "writer",
    select: "_id profile.fullname",
  });
};

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
  const article = await ArticleModel.findById(articleId);
  appAssert(article, NOT_FOUND, "Artikel tidak ditemukan");

  if (title) {
    article.title = title;
    article.slug = buildSlug(title);
  }
  if (content) article.content = content;
  if (thumbnail) article.thumbnail = thumbnail;

  await article.save();
  return article;
};

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
  const article = await ArticleModel.findOne({
    _id: articleId,
    writer: writerId,
  });

  appAssert(article, UNAUTHORIZED, "Unauthorized to edit this article");

  if (title) {
    article.title = title;
    article.slug = buildSlug(title);
  }
  if (content) article.content = content;
  if (thumbnail) article.thumbnail = thumbnail;

  await article.save();

  return ArticleModel.findById(article._id).populate({
    path: "writer",
    select: "_id profile.fullname",
  });
};

export const deleteArticleRecord = (articleId: string) => ArticleModel.findByIdAndDelete(articleId);

export const deleteOwnedArticleRecord = ({
  articleId,
  writerId,
}: {
  articleId: string;
  writerId: mongoose.Types.ObjectId | string | undefined;
}) =>
  ArticleModel.findOneAndDelete({
    _id: articleId,
    writer: writerId,
  });

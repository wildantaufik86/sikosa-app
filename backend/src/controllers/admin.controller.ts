import { Request, Response } from "express";
import UserModel from "../models/userModel";
import { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import { hashValue } from "../utils/bcrypt";
import ArticleModel from "../models/articleModel";

export const getUserProfileAll = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(OK).json({
      message: "Data semua user berhasil di dapatkan",
      data: users,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: "Terjadi kesalahan",
      error,
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userProfile = await UserModel.findById(id, "nim email profile");
    if (!userProfile) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }
    return res.status(OK).json({
      message: "Berhasil mendapatkan detail profile user",
      data: userProfile,
    });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to get detail profile", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
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
    res.status(CREATED).json({ message: "Berhasil membuat user", data: newUser });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal Membuat User", error });
  }
};

export const userProfileEdit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, password, role, fullname, description, educationBackground, specialization, nim } =
    req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }

    if (email) user.email = email;
    if (nim) user.nim = nim;
    if (password) user.password = await hashValue(password);
    if (role) user.role = role;
    if (req.file) user.profile.picture = `/uploads/${req.file.filename}`;
    if (fullname) user.profile.fullname = fullname;
    if (description) user.profile.description = description;
    if (educationBackground) user.profile.educationBackground = educationBackground;
    if (specialization) user.profile.specialization = specialization;

    await user.save();

    const updatedUser = await UserModel.findById(id).select("_id profile role nim");

    res.status(OK).json({ message: "Data user berhasil di update", data: updatedUser });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mengupdate data user", error });
  }
};

export const deleteProfileUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: "User tidak ditemukan" });
    }

    res.status(OK).json({ message: "Berhasil menghapus user" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal menghapus user", error });
  }
};

export const getArticleAll = async (req: Request, res: Response) => {
  try {
    const articles = await ArticleModel.find().populate("writer", "profile.fullname");
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Gagal mendapatkan data artikel", error });
  }
};

export const getArticleDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const articles = await ArticleModel.findById(id);
    if (!articles) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }
    res.status(OK).json({ message: "Data Artikel berhasil di dapatkan", data: articles });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Gagal mendapatkan data artikel", INTERNAL_SERVER_ERROR });
  }
};

export const createArticle = async (req: Request, res: Response) => {
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
    const articleWithWriter = await ArticleModel.findById(newArticle._id).populate({
      path: "writer",
      select: "_id profile.fullname",
    });

    res.status(CREATED).json({
      message: "Article published",
      data: formatArticle(articleWithWriter),
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to publish article", error });
  }
};

export const ArticleEdit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const article = await ArticleModel.findById(id);
    if (!article) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }

    if (title) {
      article.title = title;
      article.slug = title.toLowerCase().replace(/ /g, "-");
    }
    if (content) article.content = content;
    if (req.file) article.thumbnail = `/uploads/${req.file.filename}`;

    await article.save();
    res.status(OK).json({ message: "Article updated", data: article });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal mengupdate artikel", error });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const article = await ArticleModel.findByIdAndDelete(id);
    if (!article) {
      return res.status(NOT_FOUND).json({ message: "Artikel tidak ditemukan" });
    }

    res.status(OK).json({ message: "Artikel berhasil di hapus" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Gagal menghapus artikel", error });
  }
};

function formatArticle(article: any) {
  if (!article) return null;
  const { _id, title, content, thumbnail, slug, writer, createdAt, updatedAt } = article;
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

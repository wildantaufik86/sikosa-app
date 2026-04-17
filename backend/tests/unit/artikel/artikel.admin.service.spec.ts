import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, CONFLICT } from "../../../src/constants/http";

import ArticleModel from "../../../src/models/articleModel";

import {
  createArticleRecord,
  deleteArticleRecord,
  deleteOwnedArticleRecord,
  formatArticle,
  getAllArticles,
  getArticleById,
  updateArticleRecord,
  updateOwnedArticleRecord,
} from "../../../src/services/article.service";

jest.mock("../../../src/models/articleModel");

describe("Article Service - Role Admin", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // FORMAT ARTICLE
  // =========================
  describe("formatArticle", () => {
    test("[TC-ADM-ART-01] : input null - return null", () => {
      expect(formatArticle(null)).toBeNull();
    });

    test("[TC-ADM-ART-02] : tanpa fullname - fullname 'Unknown'", () => {
      const result = formatArticle({
        _id: "1",
        title: "t",
        content: "c",
        thumbnail: "",
        slug: "slug",
        writer: { _id: "w1", profile: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(result?.writer.fullname).toBe("Unknown");
    });

    test("[TC-ADM-ART-03] : data lengkap - format sesuai", () => {
      const result = formatArticle({
        _id: "1",
        title: "t",
        content: "c",
        thumbnail: "img",
        slug: "slug",
        writer: { _id: "w1", profile: { fullname: "Aidil" } },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(result).toMatchObject({
        id: "1",
        writer: { id: "w1", fullname: "Aidil" },
      });
    });
  });

  // =========================
  // GET ALL
  // =========================
  describe("getAllArticles", () => {
    test("[TC-ADM-ART-04] : tidak ada data - return []", async () => {
      (ArticleModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await getAllArticles();
      expect(result).toEqual([]);
    });

    test("[TC-ADM-ART-05] : data ada - return list", async () => {
      const mockData = [{ _id: "1" }];

      (ArticleModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockData),
      });

      const result = await getAllArticles();
      expect(result).toEqual(mockData);
    });
  });

  // =========================
  // GET BY ID
  // =========================
  describe("getArticleById", () => {
    test("[TC-ADM-ART-06] : ID invalid - BAD_REQUEST", async () => {
      await expect(getArticleById("invalid")).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: "ID tidak valid",
      });
    });

    test("[TC-ADM-ART-07] : tidak ditemukan - NOT_FOUND", async () => {
      (ArticleModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(getArticleById("507f1f77bcf86cd799439011")).rejects.toMatchObject({
        statusCode: NOT_FOUND,
      });
    });

    test("[TC-ADM-ART-08] : valid - return artikel", async () => {
      const mock = { _id: "1" };
      (ArticleModel.findById as jest.Mock).mockResolvedValue(mock);

      const result = await getArticleById("507f1f77bcf86cd799439011");

      expect(result).toEqual(mock);
    });
  });

  // =========================
  // CREATE
  // =========================
  describe("createArticleRecord", () => {
    test("[TC-ADM-ART-09] : tanpa title - BAD_REQUEST", async () => {
      await expect(
        createArticleRecord({
          writer: "w1",
          title: "",
          content: "c",
        })
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: "Title tidak boleh kosong",
      });
    });

    test("[TC-ADM-ART-10] : slug duplikat - CONFLICT", async () => {
      (ArticleModel.findOne as jest.Mock).mockResolvedValue({});

      await expect(
        createArticleRecord({
          writer: "w1",
          title: "Test",
          content: "c",
        })
      ).rejects.toMatchObject({
        statusCode: CONFLICT,
      });
    });

    test("[TC-ADM-ART-11] : valid - berhasil create", async () => {
      (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

      (ArticleModel as any).mockImplementation(() => ({
        _id: "1",
        save: jest.fn(),
      }));

      (ArticleModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: "1" }),
      });

      const result = await createArticleRecord({
        writer: "w1",
        title: "Test Title",
        content: "c",
      });

      expect(result).toBeDefined();
    });

    test("[TC-ADM-ART-12] : slug normalization", async () => {
      let savedSlug = "";

      (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

      (ArticleModel as any).mockImplementation((data: any) => {
        savedSlug = data.slug;
        return {
          _id: "1",
          save: jest.fn(),
        };
      });

      (ArticleModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({}),
      });

      await createArticleRecord({
        writer: "w1",
        title: "TEST   Title!!",
        content: "c",
      });

      expect(savedSlug).toBe("test-title");
    });
  });

  // =========================
  // UPDATE
  // =========================
  describe("updateArticleRecord", () => {
    test("[TC-ADM-ART-13] : ID invalid - BAD_REQUEST", async () => {
      await expect(updateArticleRecord({ articleId: "invalid" })).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
      });
    });

    test("[TC-ADM-ART-14] : tidak ditemukan - NOT_FOUND", async () => {
      (ArticleModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        updateArticleRecord({
          articleId: "507f1f77bcf86cd799439011",
        })
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
      });
    });

    test("[TC-ADM-ART-15] : title kosong - BAD_REQUEST", async () => {
      (ArticleModel.findById as jest.Mock).mockResolvedValue({});

      await expect(
        updateArticleRecord({
          articleId: "507f1f77bcf86cd799439011",
          title: "   ",
        })
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
      });
    });

    test("[TC-ADM-ART-16] : update sukses", async () => {
      const article: any = { save: jest.fn() };

      (ArticleModel.findById as jest.Mock).mockResolvedValue(article);

      await updateArticleRecord({
        articleId: "507f1f77bcf86cd799439011",
        title: "New Title",
      });

      expect(article.slug).toBe("new-title");
    });
  });

  // =========================
  // DELETE
  // =========================
  describe("deleteArticleRecord", () => {
    test("[TC-ADM-ART-17] : ID invalid - BAD_REQUEST", async () => {
      await expect(deleteArticleRecord("invalid")).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
      });
    });

    test("[TC-ADM-ART-18] : tidak ditemukan - NOT_FOUND", async () => {
      (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(deleteArticleRecord("507f1f77bcf86cd799439011")).rejects.toMatchObject({
        statusCode: NOT_FOUND,
      });
    });

    test("[TC-ADM-ART-19] : delete sukses", async () => {
      (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: "1",
      });

      const result = await deleteArticleRecord("507f1f77bcf86cd799439011");

      expect(result).toBeDefined();
    });
  });

  // =========================
  // UPDATE OWNED
  // =========================
  describe("updateOwnedArticleRecord", () => {
    test("[TC-ADM-ART-20] : bukan pemilik - UNAUTHORIZED", async () => {
      (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        updateOwnedArticleRecord({
          articleId: "507f1f77bcf86cd799439011",
          writerId: "w1",
        })
      ).rejects.toMatchObject({
        statusCode: UNAUTHORIZED,
      });
    });
  });

  // =========================
  // DELETE OWNED
  // =========================
  describe("deleteOwnedArticleRecord", () => {
    test("[TC-ADM-ART-21] : bukan pemilik - UNAUTHORIZED", async () => {
      (ArticleModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteOwnedArticleRecord({
          articleId: "507f1f77bcf86cd799439011",
          writerId: "w1",
        })
      ).rejects.toMatchObject({
        statusCode: UNAUTHORIZED,
      });
    });
  });
});

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
import { logTestContext } from "../../helpers/unit-test-logger";

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
      logTestContext({
        input: null,
        expected: 'returns null',
      });
      expect(formatArticle(null)).toBeNull();
    });

    test("[TC-ADM-ART-02] : tanpa fullname - fullname 'Unknown'", () => {
      logTestContext({
        input: { _id: "1", title: "t", content: "c", thumbnail: "", slug: "slug", writer: { _id: "w1", profile: {} } },
        expected: 'returns article with writer.fullname "Unknown"',
      });
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
      logTestContext({
        input: { _id: "1", title: "t", content: "c", thumbnail: "img", slug: "slug", writer: { _id: "w1", profile: { fullname: "Aidil" } } },
        expected: 'returns formatted article with id "1" and writer.id "w1", writer.fullname "Aidil"',
      });
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
      logTestContext({
        input: {},
        expected: 'returns empty array when no articles exist',
      });
      (ArticleModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await getAllArticles();
      expect(result).toEqual([]);
    });

    test("[TC-ADM-ART-05] : data ada - return list", async () => {
      logTestContext({
        input: {},
        expected: 'returns list of articles',
      });
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
      logTestContext({
        input: { id: "invalid" },
        expected: 'throws BAD_REQUEST with message "ID tidak valid"',
      });
      await expect(getArticleById("invalid")).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: "ID tidak valid",
      });
    });

    test("[TC-ADM-ART-07] : tidak ditemukan - NOT_FOUND", async () => {
      logTestContext({
        input: { id: "507f1f77bcf86cd799439011" },
        expected: 'throws NOT_FOUND when article does not exist',
      });
      (ArticleModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(getArticleById("507f1f77bcf86cd799439011")).rejects.toMatchObject({
        statusCode: NOT_FOUND,
      });
    });

    test("[TC-ADM-ART-08] : valid - return artikel", async () => {
      logTestContext({
        input: { id: "507f1f77bcf86cd799439011" },
        expected: 'returns article object',
      });
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
      logTestContext({
        input: { writer: "w1", title: "", content: "c" },
        expected: 'throws BAD_REQUEST with message "Title tidak boleh kosong"',
      });
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
      logTestContext({
        input: { writer: "w1", title: "Test", content: "c" },
        expected: 'throws CONFLICT when slug already exists',
      });
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
      logTestContext({
        input: { writer: "w1", title: "Test Title", content: "c" },
        expected: 'returns defined article after successful creation',
      });
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
      logTestContext({
        input: { writer: "w1", title: "TEST   Title!!", content: "c" },
        expected: 'saved slug is "test-title" (normalized to lowercase with dashes)',
      });
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
      logTestContext({
        input: { articleId: "invalid" },
        expected: 'throws BAD_REQUEST for invalid article ID',
      });
      await expect(updateArticleRecord({ articleId: "invalid" })).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
      });
    });

    test("[TC-ADM-ART-14] : tidak ditemukan - NOT_FOUND", async () => {
      logTestContext({
        input: { articleId: "507f1f77bcf86cd799439011" },
        expected: 'throws NOT_FOUND when article does not exist',
      });
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
      logTestContext({
        input: { articleId: "507f1f77bcf86cd799439011", title: "   " },
        expected: 'throws BAD_REQUEST when title is whitespace-only',
      });
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
      logTestContext({
        input: { articleId: "507f1f77bcf86cd799439011", title: "New Title" },
        expected: 'article.slug updated to "new-title"',
      });
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
      logTestContext({
        input: { id: "invalid" },
        expected: 'throws BAD_REQUEST for invalid article ID',
      });
      await expect(deleteArticleRecord("invalid")).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
      });
    });

    test("[TC-ADM-ART-18] : tidak ditemukan - NOT_FOUND", async () => {
      logTestContext({
        input: { id: "507f1f77bcf86cd799439011" },
        expected: 'throws NOT_FOUND when article not found for deletion',
      });
      (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(deleteArticleRecord("507f1f77bcf86cd799439011")).rejects.toMatchObject({
        statusCode: NOT_FOUND,
      });
    });

    test("[TC-ADM-ART-19] : delete sukses", async () => {
      logTestContext({
        input: { id: "507f1f77bcf86cd799439011" },
        expected: 'returns defined deleted article object',
      });
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
      logTestContext({
        input: { articleId: "507f1f77bcf86cd799439011", writerId: "w1" },
        expected: 'throws UNAUTHORIZED when writer is not the article owner',
      });
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
      logTestContext({
        input: { articleId: "507f1f77bcf86cd799439011", writerId: "w1" },
        expected: 'throws UNAUTHORIZED when writer is not the article owner for deletion',
      });
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

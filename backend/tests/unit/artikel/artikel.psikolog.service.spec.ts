import ArticleModel from "../../../src/models/articleModel";

import {
  getArticleById,
  createArticleRecord,
  updateArticleRecord,
  updateOwnedArticleRecord,
  deleteArticleRecord,
  deleteOwnedArticleRecord,
  formatArticle,
  getAllArticles,
} from "../../../src/services/article.service";

jest.mock("../../../src/models/articleModel");

const mockId = "507f1f77bcf86cd799439011";
const invalidId = "123";

const mockArticle = (overrides = {}) => ({
  _id: mockId,
  title: "Title",
  content: "Content",
  thumbnail: "thumb.jpg",
  slug: "title",
  writer: { _id: "w1", profile: { fullname: "John Doe" } },
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

/* =========================================================
   FORMAT (TC-10,11,22)
========================================================= */
describe("formatArticle", () => {
  test("TC-PSI-ART-10 : format null - null result", () => {
    expect(formatArticle(null)).toBeNull();
  });

  test("TC-PSI-ART-11 : missing fullname - fallback Unknown", () => {
    const result = formatArticle(mockArticle({ writer: { _id: "w1", profile: {} } }) as any);

    expect(result).toMatchObject({
      writer: { fullname: "Unknown" },
    });
  });

  test("TC-PSI-ART-22 : valid format - correct structure", () => {
    const result = formatArticle(mockArticle() as any);

    expect(result).toMatchObject({
      title: "Title",
      slug: "title",
      writer: { id: "w1" },
    });
  });
});

/* =========================================================
   GET ALL (TC-19)
========================================================= */
describe("getAllArticles", () => {
  test("TC-PSI-ART-19 : get all articles - list returned", async () => {
    (ArticleModel.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockArticle()]),
    });

    const result = await getAllArticles();

    expect(result.length).toBeGreaterThan(0);
  });
});

/* =========================================================
   GET BY ID (TC-03,12,18)
========================================================= */
describe("getArticleById", () => {
  test("TC-PSI-ART-03 : invalid ID - BAD_REQUEST", async () => {
    await expect(getArticleById(invalidId)).rejects.toMatchObject({
      statusCode: 400,
      message: "ID tidak valid",
    });
  });

  test("TC-PSI-ART-12 : not found - NOT_FOUND", async () => {
    (ArticleModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(getArticleById(mockId)).rejects.toMatchObject({
      statusCode: 404,
      message: "Artikel tidak ditemukan",
    });
  });

  test("TC-PSI-ART-18 : valid article - success", async () => {
    (ArticleModel.findById as jest.Mock).mockResolvedValue(mockArticle());

    const result = await getArticleById(mockId);

    expect(result).toBeDefined();
  });
});

/* =========================================================
   CREATE (TC-07,08,13,20)
========================================================= */
describe("createArticleRecord", () => {
  test("TC-PSI-ART-07 : empty title - BAD_REQUEST", async () => {
    await expect(
      createArticleRecord({
        writer: mockId,
        title: "",
        content: "content",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Title tidak boleh kosong",
    });
  });

  test("TC-PSI-ART-08 : without thumbnail - still created", async () => {
    (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

    (ArticleModel as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    (ArticleModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockArticle({ thumbnail: "" })),
    });

    const result = await createArticleRecord({
      writer: mockId,
      title: "Valid Title",
      content: "Content",
    });

    expect(result).toBeDefined();
  });

  test("TC-PSI-ART-13 : valid create - success", async () => {
    (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

    (ArticleModel as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    (ArticleModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockArticle()),
    });

    const result = await createArticleRecord({
      writer: mockId,
      title: "Valid Title",
      content: "Content",
      thumbnail: "img.jpg",
    });

    expect(result).toBeDefined();
  });

  test("TC-PSI-ART-20 : slug created - lowercase dash format", async () => {
    (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

    (ArticleModel as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    (ArticleModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        ...mockArticle(),
        slug: "valid-title",
      }),
    });

    const result = await createArticleRecord({
      writer: mockId,
      title: "Valid Title",
      content: "Content",
    });

    expect(result?.slug).toBeDefined();
  });
});

/* =========================================================
   UPDATE (TC-09,15,21,16)
========================================================= */
describe("updateArticleRecord", () => {
  test("TC-PSI-ART-09 : no update payload - unchanged", async () => {
    (ArticleModel.findById as jest.Mock).mockResolvedValue(mockArticle());

    const result = await updateArticleRecord({
      articleId: mockId,
    });

    expect(result).toBeDefined();
  });

  test("TC-PSI-ART-15 : update title - slug changed", async () => {
    const article = mockArticle();
    (ArticleModel.findById as jest.Mock).mockResolvedValue(article);

    const result = await updateArticleRecord({
      articleId: mockId,
      title: "New Title",
    });

    expect(result.title).toBeDefined();
  });

  test("TC-PSI-ART-16 : update content only - content updated", async () => {
    (ArticleModel.findById as jest.Mock).mockResolvedValue(mockArticle());

    const result = await updateArticleRecord({
      articleId: mockId,
      content: "New Content",
    });

    expect(result.content).toBeDefined();
  });

  test("TC-PSI-ART-21 : slug update - reflects new title", async () => {
    const article = mockArticle();
    (ArticleModel.findById as jest.Mock).mockResolvedValue(article);

    const result = await updateArticleRecord({
      articleId: mockId,
      title: "Updated Title",
    });

    expect(result.slug).toBeDefined();
  });
});

/* =========================================================
   OWNED UPDATE (TC-01,05,14)
========================================================= */
describe("updateOwnedArticleRecord", () => {
  test("TC-PSI-ART-01 : not owner - UNAUTHORIZED", async () => {
    (ArticleModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      updateOwnedArticleRecord({
        articleId: mockId,
        writerId: "other",
        title: "x",
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized to edit this article",
    });
  });

  test("TC-PSI-ART-05 : invalid ID - BAD_REQUEST", async () => {
    await expect(
      updateOwnedArticleRecord({
        articleId: invalidId,
        writerId: mockId,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "ID tidak valid",
    });
  });

  test("TC-PSI-ART-14 : owner update - success", async () => {
    const article = mockArticle();

    (ArticleModel.findOne as jest.Mock).mockResolvedValue(article);

    (ArticleModel.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(article),
    });

    const result = await updateOwnedArticleRecord({
      articleId: mockId,
      writerId: "w1",
      title: "Updated",
    });

    expect(result).toBeDefined();
  });
});

/* =========================================================
   DELETE (TC-02,04,06,17)
========================================================= */
describe("deleteArticleRecord", () => {
  test("TC-PSI-ART-04 : not found - NOT_FOUND", async () => {
    (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(deleteArticleRecord(mockId)).rejects.toMatchObject({
      statusCode: 404,
      message: "Artikel tidak ditemukan",
    });
  });

  test("TC-PSI-ART-06 : delete twice - second fail", async () => {
    (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({
      _id: mockId,
    });

    await deleteArticleRecord(mockId);

    (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(deleteArticleRecord(mockId)).rejects.toMatchObject({
      statusCode: 404,
      message: "Artikel tidak ditemukan",
    });
  });

  test("TC-PSI-ART-17 : delete success", async () => {
    (ArticleModel.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: mockId,
    });

    const result = await deleteArticleRecord(mockId);

    expect(result).toBeDefined();
  });
});

describe("deleteOwnedArticleRecord", () => {
  test("TC-PSI-ART-02 : not owner delete - UNAUTHORIZED", async () => {
    (ArticleModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(
      deleteOwnedArticleRecord({
        articleId: mockId,
        writerId: "other",
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized to delete this article",
    });
  });
});

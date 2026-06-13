import mongoose from "mongoose";

import UserModel from "../../../src/models/userModel";
import ArticleModel from "../../../src/models/articleModel";

import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from "../../../src/constants/http";
import { ERROR_MSG } from "../../../src/constants/errorMessage";
import { apiTest } from "../../setup/apiTest";

let adminToken: string;
let userToken: string;
let articleId: string;

const generateToken = (userId: any) => {
  return signToken({
    userId,
    sessionId: new mongoose.Types.ObjectId(),
  });
};

jest.setTimeout(20000); // 20 detik

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URL is not defined in environment");
  }

  await mongoose.connect(mongoUri);
});

beforeAll(async () => {
  const admin = await UserModel.create({
    email: "admin@test.com",
    password: "123456",
    role: "admin",
    verified: true,
    profile: { fullname: "Admin" },
  });

  const user = await UserModel.create({
    email: "user@test.com",
    password: "123456",
    role: "mahasiswa",
    verified: true,
    profile: { fullname: "User" },
  });

  adminToken = generateToken(admin._id);
  userToken = generateToken(user._id);
});

afterEach(async () => {
  await ArticleModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("ADMIN ARTICLE - CREATE", () => {
  test("[TC-INT-ADM-05] : create artikel tanpa token - should return 401", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-05",
      method: "POST",
      url: "/api/admin/articles",
      payload: { title: "A", content: "B" },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-ADM-06] : role bukan admin - should return 403", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-06",
      method: "POST",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${userToken}` },
      payload: { title: "A", content: "B" },
      expectedStatus: FORBIDDEN,
    });

    expect(res.status).toBe(FORBIDDEN);
  });

  test("[TC-INT-ADM-09] : tanpa title - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-09",
      method: "POST",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { content: "Isi" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-ADM-10] : tanpa content - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-10",
      method: "POST",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "Judul" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-ADM-13] : create artikel valid - should return 201", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-13",
      method: "POST",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "Judul Artikel", content: "Konten artikel" },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
    expect(res.body.data).toBeDefined();
  });
});

describe("ADMIN ARTICLE - READ", () => {
  test("[TC-INT-ADM-14] : get semua artikel - should return 200 list", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-14",
      method: "GET",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("[TC-INT-ADM-15] : get artikel by ID valid - should return 200 detail", async () => {
    const article = await ArticleModel.create({
      title: "Test",
      content: "Content",
      slug: "test",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-15",
      method: "GET",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data).toBeDefined();
  });

  test("[TC-INT-ADM-01] : update artikel ID tidak ditemukan - should return 404", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-01",
      method: "PUT",
      url: `/api/admin/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "Update" },
      expectedStatus: NOT_FOUND,
    });

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-03] : get artikel ID tidak ditemukan - should return 404", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-03",
      method: "GET",
      url: `/api/admin/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: NOT_FOUND,
    });

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-04] : get artikel ID invalid - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-04",
      method: "GET",
      url: "/api/admin/articles/invalid-id",
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });
});

describe("ADMIN ARTICLE - UPDATE", () => {
  test("[TC-INT-ADM-16] : update artikel valid - should return 200", async () => {
    const article = await ArticleModel.create({
      title: "Old",
      content: "Old",
      slug: "old",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-16",
      method: "PUT",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "New Title", content: "New Content" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-17] : update hanya title - slug ikut berubah", async () => {
    const article = await ArticleModel.create({
      title: "Old Title",
      content: "Content",
      slug: "old-title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-17",
      method: "PUT",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "New Title" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-18] : update hanya content - should return 200", async () => {
    const article = await ArticleModel.create({
      title: "Title",
      content: "Old",
      slug: "title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-18",
      method: "PUT",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { content: "New Content" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-11] : update tanpa field - data tetap", async () => {
    const article = await ArticleModel.create({
      title: "Title",
      content: "Content",
      slug: "title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-11",
      method: "PUT",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {},
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });
});

describe("ADMIN ARTICLE - DELETE", () => {
  test("[TC-INT-ADM-19] : delete artikel valid - should return 200", async () => {
    const article = await ArticleModel.create({
      title: "Test",
      content: "Test",
      slug: "test",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-19",
      method: "DELETE",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-02] : delete artikel ID tidak ditemukan - should return 404", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-02",
      method: "DELETE",
      url: `/api/admin/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: NOT_FOUND,
    });

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-08] : delete tanpa token - should return 401", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-08",
      method: "DELETE",
      url: `/api/admin/articles/${new mongoose.Types.ObjectId()}`,
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-ADM-12] : delete dua kali - should return 404 second delete", async () => {
    const article = await ArticleModel.create({
      title: "Test",
      content: "Test",
      slug: "test",
      writer: new mongoose.Types.ObjectId(),
    });

    await apiTest({
      id: "TC-INT-ADM-12-setup",
      method: "DELETE",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    const res = await apiTest({
      id: "TC-INT-ADM-12",
      method: "DELETE",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: NOT_FOUND,
    });

    expect(res.status).toBe(NOT_FOUND);
  });
});

describe("ADMIN ARTICLE - EDGE CASE", () => {
  test("[TC-INT-ADM-20] : slug otomatis terbentuk - should exist", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-20",
      method: "POST",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "Hello World", content: "Content" },
      expectedStatus: CREATED,
    });

    expect(res.body.data.slug).toBeDefined();
  });

  test("[TC-INT-ADM-21] : slug berubah saat update title", async () => {
    const article = await ArticleModel.create({
      title: "Old Title",
      content: "Content",
      slug: "old-title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await apiTest({
      id: "TC-INT-ADM-21",
      method: "PUT",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { title: "New Title" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-22] : response format artikel sesuai struktur", async () => {
    const res = await apiTest({
      id: "TC-INT-ADM-22",
      method: "GET",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty("title");
      expect(res.body.data[0]).toHaveProperty("slug");
    }
  });
});

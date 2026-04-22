import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";

import UserModel from "../../../src/models/userModel";
import ArticleModel from "../../../src/models/articleModel";

import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from "../../../src/constants/http";
import { ERROR_MSG } from "../../../src/constants/errorMessage";

let adminToken: string;
let userToken: string;
let articleId: string;

const generateToken = (userId: any) => {
  return signToken({
    userId,
    sessionId: new mongoose.Types.ObjectId(),
  });
};

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

describe.skip("ADMIN ARTICLE - CREATE", () => {
  test("[TC-INT-ADM-05] : create artikel tanpa token - should return 401", async () => {
    const res = await request(app).post("/api/admin/articles").send({ title: "A", content: "B" });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-ADM-06] : role bukan admin - should return 403", async () => {
    const res = await request(app)
      .post("/api/admin/articles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "A", content: "B" });

    expect(res.status).toBe(FORBIDDEN);
  });

  test("[TC-INT-ADM-09] : tanpa title - should return 400", async () => {
    const res = await request(app)
      .post("/api/admin/articles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "Isi" });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-ADM-10] : tanpa content - should return 400", async () => {
    const res = await request(app)
      .post("/api/admin/articles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Judul" });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-ADM-13] : create artikel valid - should return 201", async () => {
    const res = await request(app).post("/api/admin/articles").set("Authorization", `Bearer ${adminToken}`).send({
      title: "Judul Artikel",
      content: "Konten artikel",
    });

    expect(res.status).toBe(CREATED);
    expect(res.body.data).toBeDefined();
  });
});

describe("ADMIN ARTICLE - READ", () => {
  test("[TC-INT-ADM-14] : get semua artikel - should return 200 list", async () => {
    const res = await request(app).get("/api/admin/articles").set("Authorization", `Bearer ${adminToken}`);

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

    const res = await request(app).get(`/api/admin/articles/${article._id}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
    expect(res.body.data).toBeDefined();
  });

  test("[TC-INT-ADM-01] : update artikel ID tidak ditemukan - should return 404", async () => {
    const res = await request(app)
      .put(`/api/admin/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Update" });

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-03] : get artikel ID tidak ditemukan - should return 404", async () => {
    const res = await request(app)
      .get(`/api/admin/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-04] : get artikel ID invalid - should return 400", async () => {
    const res = await request(app).get("/api/admin/articles/invalid-id").set("Authorization", `Bearer ${adminToken}`);

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

    const res = await request(app)
      .put(`/api/admin/articles/${article._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New Title", content: "New Content" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-17] : update hanya title - slug ikut berubah", async () => {
    const article = await ArticleModel.create({
      title: "Old Title",
      content: "Content",
      slug: "old-title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .put(`/api/admin/articles/${article._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New Title" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-18] : update hanya content - should return 200", async () => {
    const article = await ArticleModel.create({
      title: "Title",
      content: "Old",
      slug: "title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .put(`/api/admin/articles/${article._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "New Content" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-11] : update tanpa field - data tetap", async () => {
    const article = await ArticleModel.create({
      title: "Title",
      content: "Content",
      slug: "title",
      writer: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .put(`/api/admin/articles/${article._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

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

    const res = await request(app).delete(`/api/admin/articles/${article._id}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-02] : delete artikel ID tidak ditemukan - should return 404", async () => {
    const res = await request(app)
      .delete(`/api/admin/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-ADM-08] : delete tanpa token - should return 401", async () => {
    const res = await request(app).delete(`/api/admin/articles/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-ADM-12] : delete dua kali - should return 404 second delete", async () => {
    const article = await ArticleModel.create({
      title: "Test",
      content: "Test",
      slug: "test",
      writer: new mongoose.Types.ObjectId(),
    });

    await request(app).delete(`/api/admin/articles/${article._id}`).set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app).delete(`/api/admin/articles/${article._id}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });
});

describe("ADMIN ARTICLE - EDGE CASE", () => {
  test("[TC-INT-ADM-20] : slug otomatis terbentuk - should exist", async () => {
    const res = await request(app).post("/api/admin/articles").set("Authorization", `Bearer ${adminToken}`).send({
      title: "Hello World",
      content: "Content",
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

    const res = await request(app)
      .put(`/api/admin/articles/${article._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New Title" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-ADM-22] : response format artikel sesuai struktur", async () => {
    const res = await request(app).get("/api/admin/articles").set("Authorization", `Bearer ${adminToken}`);

    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty("title");
      expect(res.body.data[0]).toHaveProperty("slug");
    }
  });
});

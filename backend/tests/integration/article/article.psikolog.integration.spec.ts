import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";

import UserModel from "../../../src/models/userModel";
import ArticleModel from "../../../src/models/articleModel";

import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "../../../src/constants/http";

let psikologToken: string;
let otherToken: string;
let adminToken: string;

let psikologId: any;
let otherId: any;

const generateToken = (userId: any) => {
  return signToken({
    userId,
    sessionId: new mongoose.Types.ObjectId(),
  });
};

jest.setTimeout(20000); // 20 detik

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await ArticleModel.deleteMany({});

  const psikolog = await UserModel.create({
    email: `psikolog_${Date.now()}@test.com`,
    password: "123456",
    role: "psikolog",
    verified: true,
    profile: { fullname: "Psikolog" },
  });

  const other = await UserModel.create({
    email: `other_${Date.now()}@test.com`,
    password: "123456",
    role: "psikolog",
    verified: true,
    profile: { fullname: "Other" },
  });

  const admin = await UserModel.create({
    email: `admin_${Date.now()}@test.com`,
    password: "123456",
    role: "admin",
    verified: true,
    profile: { fullname: "Admin" },
  });

  psikologId = psikolog._id;
  otherId = other._id;

  psikologToken = generateToken(psikologId);
  otherToken = generateToken(otherId);
  adminToken = generateToken(admin._id);
});

//
// ================= NEGATIVE =================
//
describe("PSIKOLOG ARTICLE - NEGATIVE", () => {
  test("[TC-INT-PSI-01] Update bukan milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: otherId,
    });

    const res = await request(app)
      .put(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "Update" });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-02] Delete bukan milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: otherId,
    });

    const res = await request(app)
      .delete(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-03] Update tidak ditemukan", async () => {
    const res = await request(app)
      .put(`/api/psikolog/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "X" });

    expect([UNAUTHORIZED, NOT_FOUND]).toContain(res.status);
  });

  test("[TC-INT-PSI-04] Delete tidak ditemukan", async () => {
    const res = await request(app)
      .delete(`/api/psikolog/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${psikologToken}`);

    expect([UNAUTHORIZED, NOT_FOUND]).toContain(res.status);
  });

  test("[TC-INT-PSI-05] Create tanpa token", async () => {
    const res = await request(app).post("/api/psikolog/articles").send({
      title: "A",
      content: "B",
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-06] Update tanpa token", async () => {
    const res = await request(app).put(`/api/psikolog/articles/${new mongoose.Types.ObjectId()}`).send({ title: "X" });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-07] Delete tanpa token", async () => {
    const res = await request(app).delete(`/api/psikolog/articles/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-08] Create tanpa title", async () => {
    const res = await request(app)
      .post("/api/psikolog/articles")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ content: "B" });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-09] Create tanpa content", async () => {
    const res = await request(app)
      .post("/api/psikolog/articles")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "A" });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-10] Update ID invalid", async () => {
    const res = await request(app)
      .put("/api/psikolog/articles/invalid-id")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "X" });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-12] Get artikel tidak ditemukan", async () => {
    const res = await request(app)
      .get(`/api/admin/articles/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });
});

//
// ================= EDGE =================
//
describe("PSIKOLOG ARTICLE - EDGE", () => {
  test("[TC-INT-PSI-11] Delete dua kali", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    await request(app).delete(`/api/psikolog/articles/${article._id}`).set("Authorization", `Bearer ${psikologToken}`);

    const res = await request(app)
      .delete(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`);

    expect([NOT_FOUND, UNAUTHORIZED]).toContain(res.status);
  });
});

//
// ================= POSITIVE =================
//
describe("PSIKOLOG ARTICLE - POSITIVE", () => {
  test("[TC-INT-PSI-13] Create artikel valid", async () => {
    const res = await request(app)
      .post("/api/psikolog/articles")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "Hello", content: "World" });

    expect(res.status).toBe(CREATED);
  });

  test("[TC-INT-PSI-14] Update milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "Old",
      content: "Old",
      slug: "old",
      writer: psikologId,
    });

    const res = await request(app)
      .put(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "New" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-15] Update title → slug berubah", async () => {
    const article = await ArticleModel.create({
      title: "Old Title",
      content: "C",
      slug: "old-title",
      writer: psikologId,
    });

    const res = await request(app)
      .put(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "New Title" });

    expect(res.status).toBe(OK);
    expect(res.body.data.slug).toBe("new-title");
  });

  test("[TC-INT-PSI-16] Update content", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "Old",
      slug: "a",
      writer: psikologId,
    });

    const res = await request(app)
      .put(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ content: "New Content" });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-17] Delete milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await request(app)
      .delete(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`);

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-18] Get artikel by ID", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await request(app).get(`/api/admin/articles/${article._id}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-19] Get semua artikel", async () => {
    await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await request(app).get("/api/admin/articles").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("[TC-INT-PSI-20] Slug terbentuk", async () => {
    const res = await request(app)
      .post("/api/psikolog/articles")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "Hello World", content: "X" });

    expect(res.body.data.slug).toBe("hello-world");
  });

  test("[TC-INT-PSI-21] Slug update", async () => {
    const article = await ArticleModel.create({
      title: "Old",
      content: "X",
      slug: "old",
      writer: psikologId,
    });

    const res = await request(app)
      .put(`/api/psikolog/articles/${article._id}`)
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "Updated Title" });

    expect(res.body.data.slug).toBe("updated-title");
  });

  test("[TC-INT-PSI-22] Response format valid", async () => {
    const res = await request(app)
      .post("/api/psikolog/articles")
      .set("Authorization", `Bearer ${psikologToken}`)
      .send({ title: "Format Test", content: "X" });

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("title");
    expect(res.body.data).toHaveProperty("slug");
    expect(res.body.data).toHaveProperty("writer");
  });
});

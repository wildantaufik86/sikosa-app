import mongoose from "mongoose";

import UserModel from "../../../src/models/userModel";
import ArticleModel from "../../../src/models/articleModel";

import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "../../../src/constants/http";
import { apiTest } from "../../setup/apiTest";

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

    const res = await apiTest({
      id: "TC-INT-PSI-01",
      method: "PUT",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "Update" },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-02] Delete bukan milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: otherId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-02",
      method: "DELETE",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-03] Update tidak ditemukan", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-03",
      method: "PUT",
      url: `/api/psikolog/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "X" },
      expectedStatus: UNAUTHORIZED,
    });

    expect([UNAUTHORIZED, NOT_FOUND]).toContain(res.status);
  });

  test("[TC-INT-PSI-04] Delete tidak ditemukan", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-04",
      method: "DELETE",
      url: `/api/psikolog/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      expectedStatus: UNAUTHORIZED,
    });

    expect([UNAUTHORIZED, NOT_FOUND]).toContain(res.status);
  });

  test("[TC-INT-PSI-05] Create tanpa token", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-05",
      method: "POST",
      url: "/api/psikolog/articles",
      payload: { title: "A", content: "B" },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-06] Update tanpa token", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-06",
      method: "PUT",
      url: `/api/psikolog/articles/${new mongoose.Types.ObjectId()}`,
      payload: { title: "X" },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-07] Delete tanpa token", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-07",
      method: "DELETE",
      url: `/api/psikolog/articles/${new mongoose.Types.ObjectId()}`,
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-PSI-08] Create tanpa title", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-08",
      method: "POST",
      url: "/api/psikolog/articles",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { content: "B" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-09] Create tanpa content", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-09",
      method: "POST",
      url: "/api/psikolog/articles",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "A" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-10] Update ID invalid", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-10",
      method: "PUT",
      url: "/api/psikolog/articles/invalid-id",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "X" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("[TC-INT-PSI-12] Get artikel tidak ditemukan", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-12",
      method: "GET",
      url: `/api/admin/articles/${new mongoose.Types.ObjectId()}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: NOT_FOUND,
    });

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

    await apiTest({
      id: "TC-INT-PSI-11-setup",
      method: "DELETE",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      expectedStatus: OK,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-11",
      method: "DELETE",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      expectedStatus: NOT_FOUND,
    });

    expect([NOT_FOUND, UNAUTHORIZED]).toContain(res.status);
  });
});

//
// ================= POSITIVE =================
//
describe("PSIKOLOG ARTICLE - POSITIVE", () => {
  test("[TC-INT-PSI-13] Create artikel valid", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-13",
      method: "POST",
      url: "/api/psikolog/articles",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "Hello", content: "World" },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  test("[TC-INT-PSI-14] Update milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "Old",
      content: "Old",
      slug: "old",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-14",
      method: "PUT",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "New" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-15] Update title → slug berubah", async () => {
    const article = await ArticleModel.create({
      title: "Old Title",
      content: "C",
      slug: "old-title",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-15",
      method: "PUT",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "New Title" },
      expectedStatus: OK,
    });

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

    const res = await apiTest({
      id: "TC-INT-PSI-16",
      method: "PUT",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { content: "New Content" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-17] Delete milik sendiri", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-17",
      method: "DELETE",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-18] Get artikel by ID", async () => {
    const article = await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-18",
      method: "GET",
      url: `/api/admin/articles/${article._id}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-PSI-19] Get semua artikel", async () => {
    await ArticleModel.create({
      title: "A",
      content: "B",
      slug: "a",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-19",
      method: "GET",
      url: "/api/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("[TC-INT-PSI-20] Slug terbentuk", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-20",
      method: "POST",
      url: "/api/psikolog/articles",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "Hello World", content: "X" },
      expectedStatus: CREATED,
    });

    expect(res.body.data.slug).toBe("hello-world");
  });

  test("[TC-INT-PSI-21] Slug update", async () => {
    const article = await ArticleModel.create({
      title: "Old",
      content: "X",
      slug: "old",
      writer: psikologId,
    });

    const res = await apiTest({
      id: "TC-INT-PSI-21",
      method: "PUT",
      url: `/api/psikolog/articles/${article._id}`,
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "Updated Title" },
      expectedStatus: OK,
    });

    expect(res.body.data.slug).toBe("updated-title");
  });

  test("[TC-INT-PSI-22] Response format valid", async () => {
    const res = await apiTest({
      id: "TC-INT-PSI-22",
      method: "POST",
      url: "/api/psikolog/articles",
      headers: { Authorization: `Bearer ${psikologToken}` },
      payload: { title: "Format Test", content: "X" },
      expectedStatus: CREATED,
    });

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("title");
    expect(res.body.data).toHaveProperty("slug");
    expect(res.body.data).toHaveProperty("writer");
  });
});

import mongoose from "mongoose";
import UserModel from "../../../src/models/userModel";
import SessionModel from "../../../src/models/sessionModel";
import { BAD_REQUEST, OK, NOT_FOUND, UNAUTHORIZED } from "../../../src/constants/http";
import { apiTest } from "../../setup/apiTest";

jest.setTimeout(20000);

describe("Auth Integration - Login", () => {
  let mahasiswaUser: any;
  let psikologUser: any;
  let adminUser: any;

  const BASE_URL = "/api/auth/login";

  // helper
  const extractCookies = (res: any) => {
    const cookies = res.headers["set-cookie"];
    return Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);

    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});

    // seed users
    mahasiswaUser = await UserModel.create({
      email: "mahasiswa@mail.com",
      password: "Valid123!",
      role: "mahasiswa",
      verified: false,
      profile: { fullname: "Mahasiswa User" },
    });

    psikologUser = await UserModel.create({
      email: "psikolog@mail.com",
      password: "Valid123!",
      role: "psikolog",
      verified: true,
      profile: { fullname: "Psikolog User" },
    });

    adminUser = await UserModel.create({
      email: "admin@mail.com",
      password: "Valid123!",
      role: "admin",
      verified: true,
      profile: { fullname: "Admin User" },
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await SessionModel.deleteMany({});
  });

  // =========================
  // VALIDATION (ZOD)
  // =========================

  test("TC-INT-LOGIN-001 : body kosong - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-001",
      method: "POST",
      url: BASE_URL,
      payload: {},
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test("TC-INT-LOGIN-002 : email tidak dikirim - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-002",
      method: "POST",
      url: BASE_URL,
      payload: { password: "Valid123!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body.errors.some((e: any) => e.path === "email")).toBe(true);
  });

  test("TC-INT-LOGIN-003 : password tidak dikirim - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-003",
      method: "POST",
      url: BASE_URL,
      payload: { email: "test@mail.com" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body.errors.some((e: any) => e.path === "password")).toBe(true);
  });

  test("TC-INT-LOGIN-004 : format email invalid - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-004",
      method: "POST",
      url: BASE_URL,
      payload: { email: "invalid", password: "Valid123!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body.errors[0].message.toLowerCase()).toContain("email");
  });

  test("TC-INT-LOGIN-005 : password terlalu pendek - should return 400", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-005",
      method: "POST",
      url: BASE_URL,
      payload: { email: "user@mail.com", password: "123" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body.errors[0].message.toLowerCase()).toContain("at least");
  });

  test("TC-INT-LOGIN-006 : email terlalu panjang - should return 400", async () => {
    const longEmail = `${"a".repeat(260)}@mail.com`;

    const res = await apiTest({
      id: "TC-INT-LOGIN-006",
      method: "POST",
      url: BASE_URL,
      payload: { email: longEmail, password: "Valid123!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  // =========================
  // AUTH FAILURE
  // =========================

  test("TC-INT-LOGIN-007 : user tidak ditemukan - should return 404", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-007",
      method: "POST",
      url: BASE_URL,
      payload: { email: "notfound@mail.com", password: "Valid123!" },
      expectedStatus: NOT_FOUND,
    });

    expect(res.status).toBe(NOT_FOUND);
    expect(res.body.message).toBe("User not found");
  });

  test("TC-INT-LOGIN-008 : password salah - should return 401", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-008",
      method: "POST",
      url: BASE_URL,
      payload: { email: mahasiswaUser.email, password: "Wrong123!" },
      expectedStatus: UNAUTHORIZED,
    });

    expect(res.status).toBe(UNAUTHORIZED);
    expect(res.body.message).toBe("Invalid Email or Password");
  });

  // =========================
  // NORMALIZATION
  // =========================

  test("TC-INT-LOGIN-009 : email dengan spasi - should login success", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-009",
      method: "POST",
      url: BASE_URL,
      payload: { email: `  ${mahasiswaUser.email}  `, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data.user.email).toBe(mahasiswaUser.email);
  });

  test("TC-INT-LOGIN-010 : password dengan spasi - should login success", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-010",
      method: "POST",
      url: BASE_URL,
      payload: { email: mahasiswaUser.email, password: "  Valid123!  " },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
  });

  // =========================
  // ROLE BASED
  // =========================

  test("TC-INT-LOGIN-011 : login mahasiswa - should success", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-011",
      method: "POST",
      url: BASE_URL,
      payload: { email: mahasiswaUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data.user.role).toBe("mahasiswa");
  });

  test("TC-INT-LOGIN-012 : login psikolog - should success", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-012",
      method: "POST",
      url: BASE_URL,
      payload: { email: psikologUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data.user.role).toBe("psikolog");
  });

  test("TC-INT-LOGIN-013 : login admin - should success", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-013",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data.user.role).toBe("admin");
  });

  test("TC-INT-LOGIN-014 : user belum verified tetap bisa login", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-014",
      method: "POST",
      url: BASE_URL,
      payload: { email: mahasiswaUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.status).toBe(OK);
    expect(res.body.data.user.verified).toBe(false);
  });

  // =========================
  // TOKEN & COOKIE
  // =========================

  test("TC-INT-LOGIN-015 : accessToken ada - should exist", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-015",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe("string");
  });

  test("TC-INT-LOGIN-016 : refreshToken ada - should exist", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-016",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    expect(res.body.refreshToken).toBeDefined();
  });

  test("TC-INT-LOGIN-017 : cookie accessToken terset", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-017",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.includes("accessToken"))).toBe(true);

    expect(cookies).toBeDefined();
  });

  test("TC-INT-LOGIN-018 : cookie refreshToken terset", async () => {
    const res = await apiTest({
      id: "TC-INT-LOGIN-018",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.includes("refreshToken"))).toBe(true);
  });

  // =========================
  // DATABASE ASSERTION
  // =========================

  test("TC-INT-LOGIN-019 : session tersimpan di DB", async () => {
    await apiTest({
      id: "TC-INT-LOGIN-019",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    const sessions = await SessionModel.find({ userId: adminUser._id });

    expect(sessions.length).toBe(1);
    expect(sessions[0].userId.toString()).toBe(adminUser._id.toString());
  });

  test("TC-INT-LOGIN-020 : multiple login create multiple session", async () => {
    await apiTest({
      id: "TC-INT-LOGIN-020-setup1",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    await apiTest({
      id: "TC-INT-LOGIN-020-setup2",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: OK,
    });

    const sessions = await SessionModel.find({ userId: adminUser._id });

    expect(sessions.length).toBe(2);
  });

  // =========================
  // FAILURE INJECTION
  // =========================

  test("TC-INT-LOGIN-021 : DB error find user - should 500", async () => {
    jest.spyOn(UserModel, "findOne").mockRejectedValueOnce(new Error("DB Error"));

    const res = await apiTest({
      id: "TC-INT-LOGIN-021",
      method: "POST",
      url: BASE_URL,
      payload: { email: "test@mail.com", password: "Valid123!" },
      expectedStatus: 500,
    });

    expect(res.status).toBe(500);
  });

  test("TC-INT-LOGIN-022 : comparePassword error - should 500", async () => {
    jest.spyOn(UserModel, "findOne").mockResolvedValueOnce({
      comparePassword: () => {
        throw new Error("error");
      },
    } as any);

    const res = await apiTest({
      id: "TC-INT-LOGIN-022",
      method: "POST",
      url: BASE_URL,
      payload: { email: "user@mail.com", password: "Valid123!" },
      expectedStatus: 500,
    });

    expect(res.status).toBe(500);
  });

  test("TC-INT-LOGIN-023 : session create error - should 500", async () => {
    jest.spyOn(SessionModel, "create").mockRejectedValueOnce(new Error("fail"));

    const res = await apiTest({
      id: "TC-INT-LOGIN-023",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: 500,
    });

    expect(res.status).toBe(500);
  });

  test("TC-INT-LOGIN-024 : token error - should 500", async () => {
    jest.spyOn(require("../../../src/utils/jwt"), "signToken").mockImplementation(() => {
      throw new Error("token error");
    });

    const res = await apiTest({
      id: "TC-INT-LOGIN-024",
      method: "POST",
      url: BASE_URL,
      payload: { email: adminUser.email, password: "Valid123!" },
      expectedStatus: 500,
    });

    expect(res.status).toBe(500);
  });
});

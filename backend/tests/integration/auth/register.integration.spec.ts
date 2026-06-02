import mongoose from "mongoose";

import UserModel from "../../../src/models/userModel";
import SessionModel from "../../../src/models/sessionModel";
import VerificationCodeModel from "../../../src/models/verificationCodeModel";

import { BAD_REQUEST, CREATED, CONFLICT, FORBIDDEN } from "../../../src/constants/http";

import { apiTest } from "../../setup/apiTest";

jest.setTimeout(30000);

const BASE_URL = "/api/auth/register";

const basePayload = {
  email: "user@mail.com",
  password: "Password1!",
  confirmPassword: "Password1!",
  role: "mahasiswa",
  nim: "12345678",
  profile: {
    fullname: "Aidil",
    picture: "",
  },
};

// helper
const extractCookies = (res: any) => {
  const cookies = res.headers["set-cookie"];
  return Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
};

describe("Auth Integration - Register", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});
    await VerificationCodeModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ======================
  // BASIC VALIDATION
  // ======================

  test("TC-INT-REG-001 : tanpa body - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-001",
      method: "POST",
      url: BASE_URL,
      payload: undefined,
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body).toHaveProperty("message");
  });

  test("TC-INT-REG-002 : email invalid - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-002",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, email: "invalid" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-003 : email kosong - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-003",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, email: "" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-004 : password tidak match - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-004",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, confirmPassword: "wrong" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-005 : password < 6 - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-005",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, password: "123", confirmPassword: "123" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-006 : role tidak valid - should 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-006",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, role: "user" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  // ======================
  // ROLE
  // ======================

  test("TC-INT-REG-007 : tanpa role - default mahasiswa", async () => {
    const { role, ...payload } = basePayload;

    const res = await apiTest({
      id: "TC-INT-REG-007",
      method: "POST",
      url: BASE_URL,
      payload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
    expect(res.body.role).toBe("mahasiswa");
  });

  test("TC-INT-REG-008 : register mahasiswa valid - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-008",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);

    const user = await UserModel.findOne({ email: basePayload.email });
    expect(user).toBeTruthy();
  });

  test("TC-INT-REG-009 : register admin - forbidden", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-009",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, role: "admin" },
      expectedStatus: FORBIDDEN,
    });

    expect(res.status).toBe(FORBIDDEN);
  });

  test("TC-INT-REG-010 : register psikolog - forbidden", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-010",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, role: "psikolog" },
      expectedStatus: FORBIDDEN,
    });

    expect(res.status).toBe(FORBIDDEN);
  });

  // ======================
  // EMAIL
  // ======================

  test("TC-INT-REG-011 : email duplicate - 409", async () => {
    // Request pertama untuk membuat user awal
    await apiTest({
      id: "TC-INT-REG-011-setup",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    // Request kedua untuk memvalidasi konflik
    const res = await apiTest({
      id: "TC-INT-REG-011",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CONFLICT,
    });

    expect(res.status).toBe(CONFLICT);
  });

  test("TC-INT-REG-012 : email valid - lanjut", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-012",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  // ======================
  // PASSWORD
  // ======================

  test("TC-INT-REG-013 : tanpa uppercase - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-013",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, password: "password1!", confirmPassword: "password1!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-014 : tanpa angka - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-014",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, password: "Password!", confirmPassword: "Password!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-015 : tanpa simbol - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-015",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, password: "Password1", confirmPassword: "Password1" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-016 : password < 8 (service) - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-016",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, password: "Pass1!", confirmPassword: "Pass1!" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-017 : password valid - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-017",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  // ======================
  // PROFILE
  // ======================

  test("TC-INT-REG-018 : tanpa profile - 400", async () => {
    const { profile, ...payload } = basePayload;

    const res = await apiTest({
      id: "TC-INT-REG-018",
      method: "POST",
      url: BASE_URL,
      payload,
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-019 : fullname kosong - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-019",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "" } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-020 : fullname angka - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-020",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "123" } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-021 : fullname pendek - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-021",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "A" } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-022 : fullname panjang - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-022",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "A".repeat(60) } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-023 : fullname valid - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-023",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  // ======================
  // PICTURE
  // ======================

  test("TC-INT-REG-024 : tanpa picture - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-024",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "Aidil" } },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  test("TC-INT-REG-025 : picture invalid url - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-025",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "Aidil", picture: "abc" } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-026 : picture bukan image - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-026",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "Aidil", picture: "file.pdf" } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-027 : picture panjang - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-027",
      method: "POST",
      url: BASE_URL,
      payload: {
        ...basePayload,
        profile: { fullname: "Aidil", picture: "http://" + "a".repeat(300) + ".jpg" },
      },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-028 : picture valid - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-028",
      method: "POST",
      url: BASE_URL,
      payload: {
        ...basePayload,
        profile: { fullname: "Aidil", picture: "http://image.com/a.jpg" },
      },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  // ======================
  // NIM
  // ======================

  test("TC-INT-REG-029 : nim valid - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-029",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  test("TC-INT-REG-030 : nim non numeric - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-030",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, nim: "ABC" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-031 : nim pendek - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-031",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, nim: "123" },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-032 : nim panjang - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-032",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, nim: "1".repeat(20) },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-033 : nim kosong - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-033",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, nim: "" },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  // ======================
  // SIDE EFFECT
  // ======================

  test("TC-INT-REG-034 : user tersimpan - DB check", async () => {
    await apiTest({
      id: "TC-INT-REG-034",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const user = await UserModel.findOne({ email: basePayload.email });
    expect(user).toBeTruthy();
  });

  test("TC-INT-REG-035 : password hash - DB check", async () => {
    await apiTest({
      id: "TC-INT-REG-035",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const user = await UserModel.findOne({ email: basePayload.email });
    expect(user?.password).not.toBe(basePayload.password);
  });

  test("TC-INT-REG-036 : verification code dibuat", async () => {
    await apiTest({
      id: "TC-INT-REG-036",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const user = await UserModel.findOne({ email: basePayload.email });
    const verification = await VerificationCodeModel.findOne({ userId: user?._id });

    expect(verification).toBeTruthy();
  });

  test("TC-INT-REG-037 : session dibuat", async () => {
    await apiTest({
      id: "TC-INT-REG-037",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const user = await UserModel.findOne({ email: basePayload.email });
    const session = await SessionModel.findOne({ userId: user?._id });

    expect(session).toBeTruthy();
  });

  test("TC-INT-REG-038 : accessToken cookie", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-038",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.includes("accessToken"))).toBe(true);
  });

  test("TC-INT-REG-039 : refreshToken cookie", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-039",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.includes("refreshToken"))).toBe(true);
  });

  // ======================
  // EDGE
  // ======================

  test("TC-INT-REG-040 : email uppercase - success", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-040",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, email: "TEST@MAIL.COM" },
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
  });

  test("TC-INT-REG-041 : fullname spasi - 400", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-041",
      method: "POST",
      url: BASE_URL,
      payload: { ...basePayload, profile: { fullname: "   " } },
      expectedStatus: BAD_REQUEST,
    });

    expect(res.status).toBe(BAD_REQUEST);
  });

  test("TC-INT-REG-042 : duplicate race - one fail", async () => {
    const payload = { ...basePayload, email: "race@mail.com" };

    // Kedua request dikirim bersamaan untuk mensimulasikan race condition
    const [r1, r2] = await Promise.all([
      apiTest({ id: "TC-INT-REG-042-r1", method: "POST", url: BASE_URL, payload, expectedStatus: CREATED }),
      apiTest({ id: "TC-INT-REG-042-r2", method: "POST", url: BASE_URL, payload, expectedStatus: CONFLICT }),
    ]);

    expect([r1.status, r2.status]).toContain(CREATED);
    expect([r1.status, r2.status]).toContain(CONFLICT);
  });

  test("TC-INT-REG-043 : register sukses full assertion", async () => {
    const res = await apiTest({
      id: "TC-INT-REG-043",
      method: "POST",
      url: BASE_URL,
      payload: basePayload,
      expectedStatus: CREATED,
    });

    expect(res.status).toBe(CREATED);
    expect(res.body.email).toBe(basePayload.email);

    const user = await UserModel.findOne({ email: basePayload.email });
    expect(user).toBeTruthy();

    const session = await SessionModel.findOne({ userId: user?._id });
    expect(session).toBeTruthy();

    const verification = await VerificationCodeModel.findOne({ userId: user?._id });
    expect(verification).toBeTruthy();
  });
});

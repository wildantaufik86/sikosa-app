import request from "supertest";
import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";

import app from "../../../src/app";

import UserModel from "../../../src/models/userModel";
import SessionModel from "../../../src/models/sessionModel";

import { OK, UNAUTHORIZED } from "../../../src/constants/http";
import { JWT_SECRET } from "../../../src/constants/env";
import { verifyToken } from "../../../src/utils/jwt";
import { ERROR_MSG } from "../../../src/constants/errorMessage";

jest.setTimeout(20000);

const REGISTER_URL = "/api/auth/register";
const LOGIN_URL = "/api/auth/login";
const LOGOUT_URL = "/api/auth/logout";

const userPayload = {
  email: "logout@mail.com",
  password: "Password1!",
  confirmPassword: "Password1!",
  role: "mahasiswa",
  nim: "12345678",
  profile: {
    fullname: "Aidil",
    picture: "",
  },
};

const extractCookies = (res: any) => {
  const cookies = res.headers["set-cookie"];
  return Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
};

describe("Auth Integration - Logout", () => {
  let accessToken: string;
  let cookies: string[];
  let sessionId: string;
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});

    await request(app).post(REGISTER_URL).send(userPayload);

    const loginRes = await request(app).post(LOGIN_URL).send({
      email: userPayload.email,
      password: userPayload.password,
    });

    accessToken = loginRes.body.accessToken;
    cookies = extractCookies(loginRes);

    const decoded: any = verifyToken(accessToken).payload;
    sessionId = decoded.sessionId;

    const user = await UserModel.findOne({ email: userPayload.email }).lean();
    userId = (user!._id as Types.ObjectId).toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ======================
  // BASIC
  // ======================

  test("TC-INT-LOGOUT-001 : tanpa token - Unauthorized", async () => {
    const res = await request(app).post(LOGOUT_URL);

    expect(res.status).toBe(UNAUTHORIZED);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("TC-INT-LOGOUT-002 : token invalid format - Invalid token", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Authorization", "Bearer invalid");

    expect(res.status).toBe(UNAUTHORIZED);
    expect(res.body.message).toMatch(/Invalid token/i);
  });

  test("TC-INT-LOGOUT-003 : token expired - Token expired", async () => {
    const expiredToken = jwt.sign(
      { sessionId },
      JWT_SECRET,
      { expiresIn: "-1s" } // expired
    );

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
    expect(res.body.message).toMatch(ERROR_MSG.TOKEN_EXPIRED);
  });

  // ======================
  // SUCCESS
  // ======================

  test("TC-INT-LOGOUT-004 : token header - logout success", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(OK);
    expect(res.body.message).toBe("Logout successful");

    const session = await SessionModel.findById(sessionId);
    expect(session).toBeNull();
  });

  test("TC-INT-LOGOUT-005 : token cookie - logout success", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Cookie", cookies);

    expect(res.status).toBe(OK);
    expect(res.body.message).toBe("Logout successful");

    const session = await SessionModel.findById(sessionId);
    expect(session).toBeNull();
  });

  // ======================
  // SESSION
  // ======================

  test("TC-INT-LOGOUT-006 : session tidak ada - Invalid token", async () => {
    await SessionModel.findByIdAndDelete(sessionId);

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
    expect(res.body.message).toMatch(/Invalid token/i);
  });

  test("TC-INT-LOGOUT-007 : logout hapus session - DB check", async () => {
    await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    const session = await SessionModel.findById(sessionId);
    expect(session).toBeNull();
  });

  // ======================
  // COOKIE
  // ======================

  test("TC-INT-LOGOUT-008 : clear cookie", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Cookie", cookies);

    const setCookie = extractCookies(res);

    expect(setCookie.some((c) => c.includes("accessToken"))).toBe(true);
    expect(setCookie.some((c) => c.includes("refreshToken"))).toBe(true);
  });

  // ======================
  // DOUBLE
  // ======================

  test("TC-INT-LOGOUT-009 : logout dua kali - Invalid token", async () => {
    await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  // ======================
  // TOKEN MANIPULATION
  // ======================

  test("TC-INT-LOGOUT-010 : token tanpa payload valid", async () => {
    const fakeToken = jwt.sign({}, JWT_SECRET);

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("TC-INT-LOGOUT-011 : token tanpa sessionId", async () => {
    const fakeToken = jwt.sign({ userId }, JWT_SECRET);

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("TC-INT-LOGOUT-012 : header tanpa Bearer prefix", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Authorization", accessToken);

    expect(res.status).toBe(UNAUTHORIZED);
  });

  // ======================
  // EDGE
  // ======================

  test("TC-INT-LOGOUT-013 : user dihapus - tetap success", async () => {
    await UserModel.findByIdAndDelete(userId);

    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(OK);
  });

  test("TC-INT-LOGOUT-014 : multiple session - hanya satu terhapus", async () => {
    const login2 = await request(app).post(LOGIN_URL).send({
      email: userPayload.email,
      password: userPayload.password,
    });

    const token2 = login2.body.accessToken;
    const decoded2: any = verifyToken(token2).payload;

    await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`);

    const s1 = await SessionModel.findById(sessionId);
    const s2 = await SessionModel.findById(decoded2.sessionId);

    expect(s1).toBeNull();
    expect(s2).toBeTruthy();
  });

  test("TC-INT-LOGOUT-015 : cookie + header - tetap success", async () => {
    const res = await request(app).post(LOGOUT_URL).set("Authorization", `Bearer ${accessToken}`).set("Cookie", cookies);

    expect(res.status).toBe(OK);
  });
});

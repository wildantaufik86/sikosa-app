import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";
import UserModel from "../../../src/models/userModel";
import SessionModel from "../../../src/models/sessionModel";
import { signToken } from "../../../src/utils/jwt";
import { CREATED, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../../../src/constants/http";

let adminToken: string;
let userToken: string;
let adminId: string;

// helper untuk email unik
const generateEmail = () => `test-${new mongoose.Types.ObjectId()}@mail.com`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);

  // ADMIN
  const admin = await UserModel.create({
    email: generateEmail(),
    password: "password123",
    role: "admin",
  });

  const id = admin._id as mongoose.Types.ObjectId;

  adminId = id.toString();

  const adminSession = await SessionModel.create({
    userId: admin._id,
  });

  adminToken = signToken({
    userId: admin._id,
    sessionId: adminSession._id,
  });

  // NON ADMIN
  const user = await UserModel.create({
    email: generateEmail(),
    password: "password123",
    role: "mahasiswa",
  });

  const userSession = await SessionModel.create({
    userId: user._id,
  });

  userToken = signToken({
    userId: user._id,
    sessionId: userSession._id,
  });
});

// 🔥 penting: cleanup tiap test tapi JANGAN hapus admin
afterEach(async () => {
  await UserModel.deleteMany({ _id: { $ne: adminId } });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  jest.restoreAllMocks();
});

describe("Admin User Management - Auth & Role", () => {
  test("[TC-INT-001] : tanpa token - should return UNAUTHORIZED", async () => {
    const res = await request(app).get("/api/admin/users/all");

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-002] : token invalid - should return UNAUTHORIZED", async () => {
    const res = await request(app).get("/api/admin/users/all").set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(UNAUTHORIZED);
  });

  test("[TC-INT-003] : role bukan admin - should return FORBIDDEN", async () => {
    // create fresh non-admin user
    const user = await UserModel.create({
      email: `user-${Date.now()}@mail.com`,
      password: "password123",
      role: "mahasiswa",
    });

    const session = await SessionModel.create({
      userId: user._id,
    });

    const freshToken = signToken({
      userId: user._id,
      sessionId: session._id,
    });

    const res = await request(app).get("/api/admin/users/all").set("Authorization", `Bearer ${freshToken}`);

    expect(res.status).toBe(FORBIDDEN);
  });
});

describe("GET /api/admin/users/all", () => {
  test("[TC-INT-004] : admin get all users - should return OK and array", async () => {
    const res = await request(app).get("/api/admin/users/all").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("[TC-INT-005] : no users in DB - should return empty array", async () => {
    const res = await request(app).get("/api/admin/users/all").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].role).toBe("admin");
  });
});

describe("GET /api/admin/users/:id", () => {
  let testUserId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      email: generateEmail(),
      password: "password123",
    });

    const id = user._id as mongoose.Types.ObjectId;

    testUserId = id.toString();
  });

  test("[TC-INT-007] : get user by valid id - should return OK", async () => {
    const res = await request(app).get(`/api/admin/users/${testUserId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
    expect(res.body.data).toBeDefined();
  });

  test("[TC-INT-008] : user not found - should return NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/admin/users/${fakeId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-009] : invalid id format - should return INTERNAL_SERVER_ERROR", async () => {
    const res = await request(app).get(`/api/admin/users/invalid-id`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(INTERNAL_SERVER_ERROR);
  });
});

describe("POST /api/admin/users", () => {
  test("[TC-INT-010] : create user without picture - should return CREATED", async () => {
    const email = generateEmail();

    const res = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${adminToken}`).send({
      email,
      password: "password123",
      role: "mahasiswa",
    });

    expect(res.status).toBe(CREATED);
    expect(res.body.data.email).toBe(email);
  });

  test("[TC-INT-012] : duplicate email - should return INTERNAL_SERVER_ERROR", async () => {
    const email = generateEmail();

    await UserModel.create({
      email,
      password: "password123",
    });

    const res = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${adminToken}`).send({
      email,
      password: "password123",
    });

    expect(res.status).toBe(INTERNAL_SERVER_ERROR);
  });

  test("[TC-INT-013] : missing required field - should return INTERNAL_SERVER_ERROR", async () => {
    const res = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${adminToken}`).send({});

    expect(res.status).toBe(INTERNAL_SERVER_ERROR);
  });
});

describe("PUT /api/admin/users/:id", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      email: generateEmail(),
      password: "password123",
    });

    const id = user._id as mongoose.Types.ObjectId;

    userId = id.toString();
  });

  test("[TC-INT-015] : update user success - should return OK", async () => {
    const res = await request(app).put(`/api/admin/users/${userId}`).set("Authorization", `Bearer ${adminToken}`).send({
      email: generateEmail(),
    });

    expect(res.status).toBe(OK);
    expect(res.body.data).toBeDefined();
  });

  test("[TC-INT-017] : update password - should be hashed", async () => {
    await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ password: "newpassword" });

    const user = await UserModel.findById(userId);
    expect(user?.password).not.toBe("newpassword");
  });

  test("[TC-INT-018] : user not found - should return NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).put(`/api/admin/users/${fakeId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });
});

describe("DELETE /api/admin/users/:id", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await UserModel.create({
      email: generateEmail(),
      password: "password123",
    });

    const id = user._id as mongoose.Types.ObjectId;

    userId = id.toString();
  });

  test("[TC-INT-021] : delete user success - should return OK", async () => {
    const res = await request(app).delete(`/api/admin/users/${userId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(OK);
  });

  test("[TC-INT-022] : delete user not found - should return NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/api/admin/users/${fakeId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(NOT_FOUND);
  });

  test("[TC-INT-023] : invalid id - should return INTERNAL_SERVER_ERROR", async () => {
    const res = await request(app).delete(`/api/admin/users/invalid-id`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(INTERNAL_SERVER_ERROR);
  });
});

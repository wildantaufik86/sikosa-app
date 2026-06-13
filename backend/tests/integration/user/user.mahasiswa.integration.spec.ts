import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";
import UserModel from "../../../src/models/userModel";
import { ConsultationModel } from "../../../src/models/consultationModel";
import { signToken } from "../../../src/utils/jwt";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } from "../../../src/constants/http";
import { apiTest } from "../../setup/apiTest";

jest.setTimeout(20000); // 20 detik

let userId: mongoose.Types.ObjectId;
let token: string;

const createUserAndToken = async () => {
  const uniqueEmail = `user_${Date.now()}_${Math.random()}@test.com`;

  const user = await UserModel.create({
    email: uniqueEmail,
    password: "password123",
    role: "mahasiswa",
    verified: true,
    profile: {
      fullname: "Old Name",
      picture: "",
    },
  });

  const sessionId = new mongoose.Types.ObjectId();

  const accessToken = signToken({
    userId: user._id,
    sessionId,
  });

  return { user, token: accessToken };
};

const createUserWithRole = async (role: string) => {
  const email = `${role}_${Date.now()}_${Math.random()}@test.com`;

  const user = await UserModel.create({
    email,
    password: "password123",
    role,
    verified: true,
    profile: { fullname: "Test" },
  });

  const token = signToken({
    userId: user._id,
    sessionId: new mongoose.Types.ObjectId(),
  });

  return { user, token };
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterEach(async () => {
  await Promise.all([UserModel.deleteMany({}), ConsultationModel.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  jest.restoreAllMocks();
});

describe("User Profile Integration Test", () => {
  // =========================
  // UPDATE PROFILE
  // =========================
  describe("updateUserProfile Integration", () => {
    beforeEach(async () => {
      const result = await createUserAndToken();
      userId = result.user._id as mongoose.Types.ObjectId;
      token = result.token;
    });

    test("[TC-INT-UP-001] : update fullname - fullname updated", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-001",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "New Name" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.fullname).toBe("New Name");
    });

    test("[TC-INT-UP-002] : update nim - nim updated", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-002",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { nim: "12345678" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.nim).toBe("12345678");
    });

    test("[TC-INT-UP-003] : update picture - picture updated", async () => {
      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .attach("picture", Buffer.from("fake"), "test.png");

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.picture).toBeDefined();
    });

    test("[TC-INT-UP-004] : update fullname + nim - all updated", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-004",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Updated", nim: "999" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.fullname).toBe("Updated");
      expect(user?.nim).toBe("999");
    });

    test("[TC-INT-UP-005] : empty payload - BAD_REQUEST", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-005",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: {},
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("[TC-INT-UP-006] : no token - UNAUTHORIZED", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-006",
        method: "PUT",
        url: "/api/user/profile",
        payload: { fullname: "Test" },
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-UP-007] : invalid token - UNAUTHORIZED", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-007",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: "Bearer invalid" },
        payload: { fullname: "Test" },
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-UP-008] : deleted user - UNAUTHORIZED", async () => {
      await UserModel.findByIdAndDelete(userId);

      const res = await apiTest({
        id: "TC-INT-UP-008",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Test" },
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-UP-009] : empty fullname - BAD_REQUEST", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-009",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("[TC-INT-UP-011] : unknown field - BAD_REQUEST", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-011",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { unknown: "field" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    // ================= EDGE =================
    test("[TC-INT-UP-010] : empty nim string - no update", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-010",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { nim: "" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-UP-012] : long fullname - success", async () => {
      const longName = "A".repeat(OK);

      const res = await apiTest({
        id: "TC-INT-UP-012",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: longName },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-UP-013] : partial update fullname", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-013",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Partial" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-UP-014] : partial update nim", async () => {
      const res = await apiTest({
        id: "TC-INT-UP-014",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { nim: "555" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-UP-015] : multiple request consistency", async () => {
      await apiTest({
        id: "TC-INT-UP-015-setup",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "First" },
        expectedStatus: OK,
      });

      const res = await apiTest({
        id: "TC-INT-UP-015",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "First" },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.fullname).toBe("First");
    });

    test("[TC-INT-UP-016] : role psikolog - FORBIDDEN", async () => {
      const { token } = await createUserWithRole("psikolog");

      const res = await apiTest({
        id: "TC-INT-UP-016",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Test" },
        expectedStatus: FORBIDDEN,
      });

      expect(res.status).toBe(FORBIDDEN);
    });

    test("[TC-INT-UP-017] : role admin - FORBIDDEN", async () => {
      const { token } = await createUserWithRole("admin");

      const res = await apiTest({
        id: "TC-INT-UP-017",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Test" },
        expectedStatus: FORBIDDEN,
      });

      expect(res.status).toBe(FORBIDDEN);
    });

    test("[TC-INT-UP-018] : user not found (RBAC layer) - UNAUTHORIZED", async () => {
      const { user, token } = await createUserWithRole("mahasiswa");

      await UserModel.findByIdAndDelete(user._id);

      const res = await apiTest({
        id: "TC-INT-UP-018",
        method: "PUT",
        url: "/api/user/profile",
        headers: { Authorization: `Bearer ${token}` },
        payload: { fullname: "Test" },
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });
  });

  // =========================
  // GET CONSULTATION HISTORY
  // =========================
  // describe("getUserConsultationHistory", () => {
  //   test("[IT-GCH-001] : user has consultations - return formatted data", async () => {
  //     const psikolog = await UserModel.create({
  //       email: "psikolog@test.com",
  //       password: "password123",
  //       role: "psikolog",
  //       verified: true,
  //       profile: { fullname: "Dr. Test" },
  //     });

  //     await ConsultationModel.create({
  //       userId,
  //       psychologistId: psikolog._id,
  //       status: "pending",
  //     });

  //     const res = await request(app).get("/api/user/consultation/history").set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data.length).toBe(1);
  //     expect(res.body.data[0].psychologist.fullname).toBe("Dr. Test");
  //   });

  //   test("[IT-GCH-002] : no consultation - return empty array", async () => {
  //     const res = await request(app).get("/api/user/consultation/history").set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data).toEqual([]);
  //   });

  //   test("[IT-GCH-003] : no token - UNAUTHORIZED", async () => {
  //     const res = await request(app).get("/api/user/consultation/history");

  //     expect(res.status).toBe(UNAUTHORIZED);
  //   });

  //   test("[IT-GCH-005] : psychologist deleted - fallback to Unknown", async () => {
  //     const psikolog = await UserModel.create({
  //       email: "psikolog@test.com",
  //       password: "password123",
  //       role: "psikolog",
  //       verified: true,
  //       profile: { fullname: "Dr. X" },
  //     });

  //     await ConsultationModel.create({
  //       userId,
  //       psychologistId: psikolog._id,
  //     });

  //     await UserModel.findByIdAndDelete(psikolog._id);

  //     const res = await request(app).get("/api/user/consultation/history").set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data[0].psychologist.fullname).toBe("Unknown");
  //   });
  // });

  // =========================
  // GET DOCTOR PROFILE
  // =========================
  // describe("getDoctorProfile", () => {
  //   test("[IT-GDP-001] : valid psychologist id - return profile", async () => {
  //     const psikolog = await UserModel.create({
  //       email: "psikolog@test.com",
  //       password: "password123",
  //       role: "psikolog",
  //       verified: true,
  //       profile: {
  //         fullname: "Dr. Profile",
  //       },
  //     });

  //     const res = await request(app).get(`/api/user/psikolog/${psikolog._id}`).set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data.profile.fullname).toBe("Dr. Profile");
  //   });

  //   test("[IT-GDP-002] : invalid id - return NOT_FOUND", async () => {
  //     const fakeId = new mongoose.Types.ObjectId();

  //     const res = await request(app).get(`/api/user/psikolog/${fakeId}`).set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(NOT_FOUND);
  //   });
  // });

  // =========================
  // GET ALL PSYCHOLOGIST
  // =========================
  // describe("getAllPsychologist", () => {
  //   test("[IT-GAP-001] : has data - return list", async () => {
  //     await UserModel.create({
  //       email: "psikolog@test.com",
  //       password: "password123",
  //       role: "psikolog",
  //       verified: true,
  //       profile: { fullname: "Dr A" },
  //     });

  //     const res = await request(app).get("/api/user/psikolog/all").set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data.length).toBeGreaterThan(0);
  //   });

  //   test("[IT-GAP-002] : no data - return empty array", async () => {
  //     const res = await request(app).get("/api/user/psikolog/all").set("Authorization", `Bearer ${token}`);

  //     expect(res.status).toBe(OK);
  //     expect(res.body.data).toEqual([]);
  //   });
  // });
});

import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";
import UserModel from "../../../src/models/userModel";
import { signToken } from "../../../src/utils/jwt";
import { BAD_REQUEST, OK, UNAUTHORIZED } from "../../../src/constants/http";

jest.setTimeout(15000);

let userId: mongoose.Types.ObjectId;
let token: string;

// ===== HELPERS =====
const createPsychologist = async () => {
  const email = `psikolog_${Date.now()}_${Math.random()}@test.com`;

  const user = await UserModel.create({
    email,
    password: "password123",
    role: "psikolog",
    verified: true,
    profile: {
      fullname: "Old Name",
      picture: "",
      description: "",
      specialization: "",
      educationBackground: [],
    },
  });

  const token = signToken({
    userId: user._id,
    sessionId: new mongoose.Types.ObjectId(),
  });

  return { user, token };
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

// ===== SETUP =====
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  jest.restoreAllMocks();
});

// =========================
// TEST
// =========================
describe("Psychologist Profile Integration Test", () => {
  describe("updatePsychologistProfile", () => {
    beforeEach(async () => {
      const result = await createPsychologist();
      userId = result.user._id as mongoose.Types.ObjectId;
      token = result.token;
    });

    // =========================
    // NEGATIVE - AUTH
    // =========================
    test("[TC-INT-PSI-UP-001] : no token - UNAUTHORIZED", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app).put("/api/psikolog/profile").send({ fullname: "Test" });

      expect(res.status).toBe(UNAUTHORIZED);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-002] : invalid token - UNAUTHORIZED", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", "Bearer invalid")
        .send({ fullname: "Test" });

      expect(res.status).toBe(UNAUTHORIZED);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-003] : role mahasiswa - UNAUTHORIZED", async () => {
      const { token } = await createUserWithRole("mahasiswa");

      const before = await UserModel.findById(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullname: "Test" });

      expect(res.status).toBe(UNAUTHORIZED);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-004] : role admin - UNAUTHORIZED", async () => {
      const { token } = await createUserWithRole("admin");

      const before = await UserModel.findById(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullname: "Test" });

      expect(res.status).toBe(UNAUTHORIZED);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-005] : user deleted - UNAUTHORIZED", async () => {
      await UserModel.findByIdAndDelete(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullname: "Test" });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    // =========================
    // VALIDATION
    // =========================
    test("[TC-INT-PSI-UP-006] : empty payload - BAD_REQUEST", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app).put("/api/psikolog/profile").set("Authorization", `Bearer ${token}`).send({});

      expect(res.status).toBe(BAD_REQUEST);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-007] : educationBackground not array - BAD_REQUEST", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ educationBackground: "invalid" });

      expect(res.status).toBe(BAD_REQUEST);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-008] : unknown field - BAD_REQUEST", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ unknown: "field" });

      expect(res.status).toBe(BAD_REQUEST);

      const after = await UserModel.findById(userId);
      expect(after?.profile).toEqual(before?.profile);
    });

    test("[TC-INT-PSI-UP-009] : empty fullname - OK (ignored)", async () => {
      const before = await UserModel.findById(userId);

      const res = await request(app).put("/api/psikolog/profile").set("Authorization", `Bearer ${token}`).send({ fullname: "" });

      expect(res.status).toBe(OK);

      const after = await UserModel.findById(userId);
      expect(after?.profile.fullname).toBe(before?.profile.fullname);
    });

    // =========================
    // EDGE
    // =========================
    test("[TC-INT-PSI-UP-010] : empty description - OK", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.description).toBe("");
    });

    test("[TC-INT-PSI-UP-011] : empty specialization - OK", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ specialization: "" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.specialization).toBe("");
    });

    test("[TC-INT-PSI-UP-012] : empty educationBackground array - OK", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ educationBackground: [] });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.educationBackground).toEqual([]);
    });

    // =========================
    // POSITIVE
    // =========================
    test("[TC-INT-PSI-UP-013] : update fullname - success", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullname: "New Name" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.fullname).toBe("New Name");
    });

    test("[TC-INT-PSI-UP-014] : update description - success", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Desc" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.description).toBe("Desc");
    });

    test("[TC-INT-PSI-UP-015] : update specialization - success", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ specialization: "Anxiety" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.specialization).toBe("Anxiety");
    });

    test("[TC-INT-PSI-UP-016] : update educationBackground - success", async () => {
      const data = ["S1"];

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ educationBackground: data });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.educationBackground).toEqual(data);
    });

    test("[TC-INT-PSI-UP-017] : update picture - success", async () => {
      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .attach("picture", Buffer.from("fake"), "test.png");

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.picture).toMatch(/\/uploads\//);
    });

    test("[TC-INT-PSI-UP-018] : replace picture - success", async () => {
      const first = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .attach("picture", Buffer.from("old"), "old.png");

      const oldUser = await UserModel.findById(userId);

      const second = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .attach("picture", Buffer.from("new"), "new.png");

      expect(second.status).toBe(OK);

      const newUser = await UserModel.findById(userId);

      expect(newUser?.profile.picture).not.toBe(oldUser?.profile.picture);
    });

    test("[TC-INT-PSI-UP-019] : update multiple fields - success", async () => {
      const payload = {
        fullname: "Multi",
        description: "Desc",
        specialization: "Stress",
        educationBackground: ["S2"],
      };

      const res = await request(app).put("/api/psikolog/profile").set("Authorization", `Bearer ${token}`).send(payload);

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);

      expect(user?.profile.fullname).toBe(payload.fullname);
      expect(user?.profile.description).toBe(payload.description);
      expect(user?.profile.specialization).toBe(payload.specialization);
      expect(user?.profile.educationBackground).toEqual(payload.educationBackground);
    });

    test("[TC-INT-PSI-UP-020] : idempotent update - consistent", async () => {
      await request(app).put("/api/psikolog/profile").set("Authorization", `Bearer ${token}`).send({ fullname: "Same" });

      const res = await request(app)
        .put("/api/psikolog/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullname: "Same" });

      expect(res.status).toBe(OK);

      const user = await UserModel.findById(userId);
      expect(user?.profile.fullname).toBe("Same");
    });
  });
});

import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";

import UserModel from "../../../src/models/userModel";
import { ConsultationModel } from "../../../src/models/consultationModel";
import chatRoom from "../../../src/models/chatRoom";

import { signToken } from "../../../src/utils/jwt";
import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND } from "../../../src/constants/http";

jest.setTimeout(20000);

let psikologId: mongoose.Types.ObjectId;
let mahasiswaId: mongoose.Types.ObjectId;
let psikologToken: string;
let mahasiswaToken: string;

describe("Consultation Integration - Psikolog", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);

    await UserModel.deleteMany({});
    await ConsultationModel.deleteMany({});
    await chatRoom.deleteMany({});

    const psikolog = await UserModel.create({
      email: "psikolog@test.com",
      password: "password",
      role: "psikolog",
    });

    const mahasiswa = await UserModel.create({
      email: "mahasiswa@test.com",
      password: "password",
      role: "mahasiswa",
    });

    psikologId = psikolog._id as mongoose.Types.ObjectId;
    mahasiswaId = mahasiswa._id as mongoose.Types.ObjectId;

    psikologToken = signToken({
      userId: psikologId.toString(),
      sessionId: new mongoose.Types.ObjectId().toString(),
    });

    mahasiswaToken = signToken({
      userId: mahasiswaId.toString(),
      sessionId: new mongoose.Types.ObjectId().toString(),
    });
  });

  afterEach(async () => {
    await ConsultationModel.deleteMany({});
    await chatRoom.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ======================
  // NOTIFICATIONS
  // ======================
  describe("Get Notifications", () => {
    test("TC-INT-CONS-PSI-001 : tanpa token - should 401 Unauthorized", async () => {
      const res = await request(app).get("/api/psikolog/notifications");

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("TC-INT-CONS-PSI-002 : role bukan psikolog - should 403 Forbidden", async () => {
      const res = await request(app).get("/api/psikolog/notifications").set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(FORBIDDEN);
    });

    test("TC-INT-CONS-PSI-003 : tidak ada consultation - should return []", async () => {
      const res = await request(app).get("/api/psikolog/notifications").set("Authorization", `Bearer ${psikologToken}`);

      expect(res.status).toBe(OK);
      expect(res.body.data).toEqual([]);
    });

    test("TC-INT-CONS-PSI-004 : ada consultation - should return data sesuai DB", async () => {
      await ConsultationModel.create([
        { userId: mahasiswaId, psychologistId: psikologId, status: "pending" },
        { userId: mahasiswaId, psychologistId: psikologId, status: "accepted" },
        { userId: mahasiswaId, psychologistId: psikologId, status: "rejected" },
      ]);

      const res = await request(app).get("/api/psikolog/notifications").set("Authorization", `Bearer ${psikologToken}`);

      expect(res.status).toBe(OK);
      expect(res.body.data.length).toBe(3);

      const item = res.body.data[0];
      expect(item).toHaveProperty("consultationId");
      expect(item).toHaveProperty("user");
      expect(item).toHaveProperty("status");
    });

    test("TC-INT-CONS-PSI-005 : data hanya milik psikolog login - should filter correctly", async () => {
      const other = await UserModel.create({
        email: "other@test.com",
        password: "password",
        role: "psikolog",
      });

      await ConsultationModel.create([
        { userId: mahasiswaId, psychologistId: psikologId, status: "pending" },
        { userId: mahasiswaId, psychologistId: other._id, status: "pending" },
      ]);

      const res = await request(app).get("/api/psikolog/notifications").set("Authorization", `Bearer ${psikologToken}`);

      expect(res.status).toBe(OK);
      expect(res.body.data.length).toBe(1);
    });

    test("TC-INT-CONS-PSI-006 : format response - should contain required fields", async () => {
      await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await request(app).get("/api/psikolog/notifications").set("Authorization", `Bearer ${psikologToken}`);

      const item = res.body.data[0];

      expect(item).toHaveProperty("consultationId");
      expect(item.user).toHaveProperty("_id");
      expect(item.user).toHaveProperty("email");
      expect(item).toHaveProperty("message");
      expect(item).toHaveProperty("status");
    });
  });

  // ======================
  // UPDATE STATUS
  // ======================
  describe("Update Consultation Status", () => {
    test("TC-INT-CONS-PSI-007 : tanpa token - should 401 Unauthorized", async () => {
      const res = await request(app).put(`/api/psikolog/123/status`);

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("TC-INT-CONS-PSI-008 : role bukan psikolog - should 403 Forbidden", async () => {
      const res = await request(app)
        .put(`/api/psikolog/${new mongoose.Types.ObjectId()}/status`)
        .set("Authorization", `Bearer ${mahasiswaToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(FORBIDDEN);
    });

    test("TC-INT-CONS-PSI-009 : id invalid - should 400", async () => {
      const res = await request(app)
        .put("/api/psikolog/123/status")
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-PSI-010 : consultation tidak ada - should 404", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/psikolog/${id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("TC-INT-CONS-PSI-011 : bukan owner - should 403", async () => {
      const other = await UserModel.create({
        email: "other2@test.com",
        password: "password",
        role: "psikolog",
      });

      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: other._id,
        status: "pending",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(FORBIDDEN);
    });

    test("TC-INT-CONS-PSI-012 : status invalid - should 400", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "pending" });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-PSI-013 : status bukan pending - should 400", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "accepted",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "rejected" });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-PSI-014 : pending -> accepted - should update DB & activate room", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const room = await chatRoom.create({
        consultationId: cons._id,
        participants: [mahasiswaId, psikologId],
        status: "inactive",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(OK);

      const updatedCons = await ConsultationModel.findById(cons._id);
      const updatedRoom = await chatRoom.findById(room._id);

      expect(updatedCons!.status).toBe("accepted");
      expect(updatedRoom!.status).toBe("active");
    });

    test("TC-INT-CONS-PSI-015 : pending -> rejected - should update DB only", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const room = await chatRoom.create({
        consultationId: cons._id,
        participants: [mahasiswaId, psikologId],
        status: "inactive",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "rejected" });

      expect(res.status).toBe(OK);

      const updatedCons = await ConsultationModel.findById(cons._id);
      const updatedRoom = await chatRoom.findById(room._id);

      expect(updatedCons!.status).toBe("rejected");
      expect(updatedRoom!.status).toBe("inactive");
    });

    test("TC-INT-CONS-PSI-016 : chatRoom tidak ada - should tetap update tanpa crash", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(OK);

      const updatedCons = await ConsultationModel.findById(cons._id);
      expect(updatedCons!.status).toBe("accepted");
    });

    test("TC-INT-CONS-PSI-017 : response structure - should contain message & data._id", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      expect(res.status).toBe(OK);
      expect(res.body).toHaveProperty("message");
      expect(res.body.data).toHaveProperty("_id");
    });

    test("TC-INT-CONS-PSI-018 : race condition - only one success", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      await chatRoom.create({
        consultationId: cons._id,
        participants: [mahasiswaId, psikologId],
        status: "inactive",
      });

      const req1 = request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      const req2 = request(app)
        .put(`/api/psikolog/${cons._id}/status`)
        .set("Authorization", `Bearer ${psikologToken}`)
        .send({ status: "accepted" });

      const [res1, res2] = await Promise.all([req1, req2]);

      const successCount = [res1.status, res2.status].filter((s) => s === 200).length;
      const failCount = [res1.status, res2.status].filter((s) => s === 400).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
    });
  });
});

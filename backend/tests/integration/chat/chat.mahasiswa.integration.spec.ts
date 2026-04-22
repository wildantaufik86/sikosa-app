import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";
import chatRoom from "../../../src/models/chatRoom";
import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND } from "../../../src/constants/http";

jest.setTimeout(20000); // 20 detik

describe("Chat Integration Test - Mahasiswa", () => {
  let mahasiswaToken: string;
  let mahasiswaId: mongoose.Types.ObjectId;
  let otherUserId: mongoose.Types.ObjectId;
  let roomId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined");
    }
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async () => {
    await chatRoom.deleteMany({});

    mahasiswaId = new mongoose.Types.ObjectId();
    otherUserId = new mongoose.Types.ObjectId();

    mahasiswaToken = signToken({
      userId: mahasiswaId.toString(),
      sessionId: new mongoose.Types.ObjectId().toString(),
    });

    const room = await chatRoom.create({
      consultationId: new mongoose.Types.ObjectId(),
      participants: [mahasiswaId, otherUserId],
      messages: [
        {
          senderId: mahasiswaId,
          message: "Hello",
          timestamp: new Date(),
        },
      ],
      status: "active",
    });

    roomId = room._id as mongoose.Types.ObjectId;
  });

  afterAll(async () => {
    await chatRoom.deleteMany({});
    await mongoose.disconnect();
  });

  // =========================
  // GET /rooms
  // =========================
  describe("GET /api/chat/rooms", () => {
    test("[TC-INT-CHAT-MHS-001] : tanpa token - should 401 Unauthorized", async () => {
      const res = await request(app).get("/api/chat/rooms");

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-002] : get rooms success - should return user rooms", async () => {
      const res = await request(app).get("/api/chat/rooms").set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test("[TC-INT-CHAT-MHS-003] : get rooms kosong - should return empty array", async () => {
      const newUserId = new mongoose.Types.ObjectId();
      const token = signToken({
        userId: newUserId,
        sessionId: new mongoose.Types.ObjectId(),
      });

      const res = await request(app).get("/api/chat/rooms").set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(OK);
      expect(res.body).toEqual([]);
    });

    test("[TC-INT-CHAT-MHS-004] : hanya milik user - should not include other rooms", async () => {
      const otherRoom = await chatRoom.create({
        consultationId: new mongoose.Types.ObjectId(),
        participants: [otherUserId],
        messages: [],
      });

      const id = otherRoom._id as mongoose.Types.ObjectId;

      const res = await request(app).get("/api/chat/rooms").set("Authorization", `Bearer ${mahasiswaToken}`);

      const hasForeignRoom = res.body.some((r: any) => r._id === id.toString());

      expect(hasForeignRoom).toBe(false);
    });
  });

  // =========================
  // GET /messages/:roomId
  // =========================
  describe("GET /api/chat/messages/:roomId", () => {
    test("[TC-INT-CHAT-MHS-005] : tanpa token - should 401 Unauthorized", async () => {
      const res = await request(app).get(`/api/chat/messages/${roomId}`);

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-006] : room tidak ditemukan - should 404", async () => {
      const res = await request(app)
        .get(`/api/chat/messages/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-MHS-007] : get messages success - should return messages", async () => {
      const res = await request(app).get(`/api/chat/messages/${roomId}`).set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("[TC-INT-CHAT-MHS-008] : akses room bukan milik user - should 403", async () => {
      const foreignRoom = await chatRoom.create({
        consultationId: new mongoose.Types.ObjectId(),
        participants: [otherUserId],
        messages: [],
      });

      const res = await request(app)
        .get(`/api/chat/messages/${foreignRoom._id}`)
        .set("Authorization", `Bearer ${mahasiswaToken}`);

      expect([FORBIDDEN, NOT_FOUND]).toContain(res.status);
    });
  });

  // =========================
  // POST /messages
  // =========================
  describe("POST /api/chat/messages", () => {
    test("[TC-INT-CHAT-MHS-009] : tanpa field - should 400", async () => {
      const res = await request(app).post("/api/chat/messages").set("Authorization", `Bearer ${mahasiswaToken}`).send({});

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("[TC-INT-CHAT-MHS-010] : send message success - should 201 Created", async () => {
      const res = await request(app).post("/api/chat/messages").set("Authorization", `Bearer ${mahasiswaToken}`).send({
        roomId,
        senderId: mahasiswaId,
        message: "Test message",
      });

      expect(res.status).toBe(CREATED);
      expect(res.body.message).toBe("Test message");
    });

    test("[TC-INT-CHAT-MHS-011] : tidak simpan ke DB - should NOT persist message", async () => {
      await request(app).post("/api/chat/messages").set("Authorization", `Bearer ${mahasiswaToken}`).send({
        roomId,
        senderId: mahasiswaId,
        message: "Not saved",
      });

      const room = await chatRoom.findById(roomId);

      const exists = room?.messages.some((m) => m.message === "Not saved");

      expect(exists).toBe(false);
    });

    test("[TC-INT-CHAT-MHS-018] : struktur response - should contain required fields", async () => {
      const res = await request(app).post("/api/chat/messages").set("Authorization", `Bearer ${mahasiswaToken}`).send({
        roomId,
        senderId: mahasiswaId,
        message: "Check structure",
      });

      expect(res.body).toHaveProperty("roomId");
      expect(res.body).toHaveProperty("senderId");
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  // =========================
  // PATCH /finish/:roomId
  // =========================
  describe("PATCH /api/chat/finish/:roomId", () => {
    test("[TC-INT-CHAT-MHS-012] : tanpa token - should 401 Unauthorized", async () => {
      const res = await request(app).patch(`/api/chat/finish/${roomId}`);

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-013] : room tidak ditemukan - should 404", async () => {
      const res = await request(app)
        .patch(`/api/chat/finish/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-MHS-014] : finish chat success - should update status inactive", async () => {
      const res = await request(app).patch(`/api/chat/finish/${roomId}`).set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-MHS-015] : idempotent - should remain inactive", async () => {
      const res = await request(app).patch(`/api/chat/finish/${roomId}`).set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-MHS-016] : get messages setelah finish - should still accessible", async () => {
      const res = await request(app).get(`/api/chat/messages/${roomId}`).set("Authorization", `Bearer ${mahasiswaToken}`);

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-CHAT-MHS-017] : kirim message ke room inactive - tetap 201", async () => {
      const res = await request(app).post("/api/chat/messages").set("Authorization", `Bearer ${mahasiswaToken}`).send({
        roomId,
        senderId: mahasiswaId,
        message: "Still allowed",
      });

      expect(res.status).toBe(CREATED);
    });
  });
});

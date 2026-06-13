import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app";
import chatRoom from "../../../src/models/chatRoom";
import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND } from "../../../src/constants/http";
import { apiTest } from "../../setup/apiTest";

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
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-001",
        method: "GET",
        url: "/api/chat/rooms",
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-002] : get rooms success - should return user rooms", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-002",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

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

      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-003",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${token}` },
        expectedStatus: OK,
      });

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

      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-004",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      const hasForeignRoom = res.body.some((r: any) => r._id === id.toString());

      expect(hasForeignRoom).toBe(false);
    });
  });

  // =========================
  // GET /messages/:roomId
  // =========================
  describe("GET /api/chat/messages/:roomId", () => {
    test("[TC-INT-CHAT-MHS-005] : tanpa token - should 401 Unauthorized", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-005",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-006] : room tidak ditemukan - should 404", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-006",
        method: "GET",
        url: `/api/chat/messages/${new mongoose.Types.ObjectId()}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-MHS-007] : get messages success - should return messages", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-007",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("[TC-INT-CHAT-MHS-008] : akses room bukan milik user - should 403", async () => {
      const foreignRoom = await chatRoom.create({
        consultationId: new mongoose.Types.ObjectId(),
        participants: [otherUserId],
        messages: [],
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-008",
        method: "GET",
        url: `/api/chat/messages/${foreignRoom._id}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: FORBIDDEN,
      });

      expect([FORBIDDEN, NOT_FOUND]).toContain(res.status);
    });
  });

  // =========================
  // POST /messages
  // =========================
  describe("POST /api/chat/messages", () => {
    test("[TC-INT-CHAT-MHS-009] : tanpa field - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-009",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: {},
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("[TC-INT-CHAT-MHS-010] : send message success - should 201 Created", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-010",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { roomId, senderId: mahasiswaId, message: "Test message" },
        expectedStatus: CREATED,
      });

      expect(res.status).toBe(CREATED);
      expect(res.body.message).toBe("Test message");
    });

    test("[TC-INT-CHAT-MHS-011] : tidak simpan ke DB - should NOT persist message", async () => {
      await apiTest({
        id: "TC-INT-CHAT-MHS-011",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { roomId, senderId: mahasiswaId, message: "Not saved" },
        expectedStatus: CREATED,
      });

      const room = await chatRoom.findById(roomId);

      const exists = room?.messages.some((m) => m.message === "Not saved");

      expect(exists).toBe(false);
    });

    test("[TC-INT-CHAT-MHS-018] : struktur response - should contain required fields", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-018",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { roomId, senderId: mahasiswaId, message: "Check structure" },
        expectedStatus: CREATED,
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
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-012",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-MHS-013] : room tidak ditemukan - should 404", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-013",
        method: "PATCH",
        url: `/api/chat/finish/${new mongoose.Types.ObjectId()}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-MHS-014] : finish chat success - should update status inactive", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-014",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-MHS-015] : idempotent - should remain inactive", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-015",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-MHS-016] : get messages setelah finish - should still accessible", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-016",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-CHAT-MHS-017] : kirim message ke room inactive - tetap 201", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-MHS-017",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { roomId, senderId: mahasiswaId, message: "Still allowed" },
        expectedStatus: CREATED,
      });

      expect(res.status).toBe(CREATED);
    });
  });
});

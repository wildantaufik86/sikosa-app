import mongoose from "mongoose";
import chatRoom from "../../../src/models/chatRoom";
import { signToken } from "../../../src/utils/jwt";
import { OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, TO_LARGE } from "../../../src/constants/http";
import { apiTest } from "../../setup/apiTest";

jest.setTimeout(20000); // 20 detik

describe("Chat Integration Test - Psikolog", () => {
  let psikologToken: string;
  let psikologId: mongoose.Types.ObjectId;
  let mahasiswaId: mongoose.Types.ObjectId;
  let otherPsikologId: mongoose.Types.ObjectId;
  let roomId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
  });

  beforeEach(async () => {
    await chatRoom.deleteMany({});

    psikologId = new mongoose.Types.ObjectId();
    mahasiswaId = new mongoose.Types.ObjectId();
    otherPsikologId = new mongoose.Types.ObjectId();

    psikologToken = signToken({
      userId: psikologId.toString(),
      sessionId: new mongoose.Types.ObjectId().toString(),
    });

    const room = await chatRoom.create({
      consultationId: new mongoose.Types.ObjectId(),
      participants: [psikologId, mahasiswaId],
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
    test("[TC-INT-CHAT-PSI-001] : tanpa token - should 401 Unauthorized", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-001",
        method: "GET",
        url: "/api/chat/rooms",
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-PSI-002] : get rooms success - should return user rooms", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-002",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("[TC-INT-CHAT-PSI-003] : get rooms kosong - should return empty array", async () => {
      const newUserId = new mongoose.Types.ObjectId();
      const token = signToken({
        userId: newUserId.toString(),
        sessionId: new mongoose.Types.ObjectId().toString(),
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-003",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${token}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(res.body).toEqual([]);
    });

    test("[TC-INT-CHAT-PSI-004] : hanya milik psikolog - should not include other rooms", async () => {
      const foreignRoom = await chatRoom.create({
        consultationId: new mongoose.Types.ObjectId(),
        participants: [otherPsikologId],
        messages: [],
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-004",
        method: "GET",
        url: "/api/chat/rooms",
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      const foreignId = foreignRoom._id as mongoose.Types.ObjectId;

      const exists = res.body.some((r: any) => r._id === foreignId.toString());

      expect(exists).toBe(false);
    });
  });

  // =========================
  // GET /messages
  // =========================
  describe("GET /api/chat/messages/:roomId", () => {
    test("[TC-INT-CHAT-PSI-005] : tanpa token - should 401 Unauthorized", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-005",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-PSI-006] : room tidak ditemukan - should 404", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-006",
        method: "GET",
        url: `/api/chat/messages/${new mongoose.Types.ObjectId()}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-PSI-007] : get messages success - should return messages", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-007",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("[TC-INT-CHAT-PSI-008] : akses room bukan milik psikolog - should 403", async () => {
      const foreignRoom = await chatRoom.create({
        consultationId: new mongoose.Types.ObjectId(),
        participants: [otherPsikologId],
        messages: [],
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-008",
        method: "GET",
        url: `/api/chat/messages/${foreignRoom._id}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: FORBIDDEN,
      });

      expect(res.status).toBe(FORBIDDEN);
    });
  });

  // =========================
  // POST /messages
  // =========================
  describe("POST /api/chat/messages", () => {
    test("[TC-INT-CHAT-PSI-010] : tanpa field - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-010",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: {},
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("[TC-INT-CHAT-PSI-011] : send message success - should 201 Created", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-011",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { roomId, senderId: psikologId, message: "Reply from psikolog" },
        expectedStatus: CREATED,
      });

      expect(res.status).toBe(CREATED);
    });

    test("[TC-INT-CHAT-PSI-012] : tidak simpan ke DB - should NOT persist message", async () => {
      await apiTest({
        id: "TC-INT-CHAT-PSI-012",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { roomId, senderId: psikologId, message: "Not saved" },
        expectedStatus: CREATED,
      });

      const room = await chatRoom.findById(roomId);
      const exists = room?.messages.some((m) => m.message === "Not saved");

      expect(exists).toBe(false);
    });

    test("[TC-INT-CHAT-PSI-015] : message terlalu panjang - OK", async () => {
      const longMessage = "a".repeat(1001);

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-015",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { roomId, senderId: psikologId, message: longMessage },
        expectedStatus: TO_LARGE,
      });

      expect(res.status).toBe(TO_LARGE);
    });

    test("[TC-INT-CHAT-PSI-016] : message mengandung script - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-016",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { roomId, senderId: psikologId, message: "<script>alert(1)</script>" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });
  });

  // =========================
  // PATCH /finish
  // =========================
  describe("PATCH /api/chat/finish/:roomId", () => {
    test("[TC-INT-CHAT-PSI-017] : tanpa token - should 401 Unauthorized", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-017",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("[TC-INT-CHAT-PSI-018] : room tidak ditemukan - should 404", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-018",
        method: "PATCH",
        url: `/api/chat/finish/${new mongoose.Types.ObjectId()}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("[TC-INT-CHAT-PSI-019] : finish chat success - should update status inactive", async () => {
      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-019",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-PSI-020] : idempotent - should remain inactive", async () => {
      await apiTest({
        id: "TC-INT-CHAT-PSI-020-setup",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-020",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);

      const updated = await chatRoom.findById(roomId);
      expect(updated?.status).toBe("inactive");
    });

    test("[TC-INT-CHAT-PSI-021] : get messages setelah finish - should still accessible", async () => {
      await apiTest({
        id: "TC-INT-CHAT-PSI-021-setup",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-021",
        method: "GET",
        url: `/api/chat/messages/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
    });

    test("[TC-INT-CHAT-PSI-022] : kirim message ke room inactive - behavior tergantung controller", async () => {
      await apiTest({
        id: "TC-INT-CHAT-PSI-022-setup",
        method: "PATCH",
        url: `/api/chat/finish/${roomId}`,
        headers: { Authorization: `Bearer ${psikologToken}` },
        expectedStatus: OK,
      });

      const res = await apiTest({
        id: "TC-INT-CHAT-PSI-022",
        method: "POST",
        url: "/api/chat/messages",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { roomId, senderId: psikologId, message: "After finish" },
        expectedStatus: CREATED,
      });

      expect([CREATED, BAD_REQUEST]).toContain(res.status);
    });
  });
});

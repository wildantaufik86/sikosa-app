import chatRoom from "../../../src/models/chatRoom";
import { ConsultationModel } from "../../../src/models/consultationModel";
import { getChatAsMahasiswa, sendMessageAsMahasiswa } from "../../../src/services/consultation.service";

jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

describe("Chat Service - Mahasiswa", () => {
  const mahasiswaId = "507f1f77bcf86cd799439011";
  const psikologId = "507f1f77bcf86cd799439012";
  const otherUserId = "507f1f77bcf86cd799439099";
  const consultationId = "507f1f77bcf86cd799439013";

  const createConsultation = (status: "pending" | "accepted" | "rejected" = "accepted") => ({
    _id: consultationId,
    status,
    userId: { toString: () => mahasiswaId },
    psychologistId: { toString: () => psikologId },
  });

  const createRoom = (overrides: Record<string, unknown> = {}) => ({
    consultationId,
    participants: [{ toString: () => mahasiswaId }, { toString: () => psikologId }],
    messages: [] as Array<{ senderId: string; message: string; timestamp: Date }>,
    status: "active" as const,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("TC-MHS-01: kirim pesan tanpa userId", async () => {
    await expect(sendMessageAsMahasiswa({ userId: undefined, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized access",
    });
  });

  test("TC-MHS-02: consultationId kosong", async () => {
    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId: "", message: "halo" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Consultation ID required",
    });
  });

  test("TC-MHS-03: consultationId tidak valid format", async () => {
    await expect(
      sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId: "invalid", message: "halo" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid consultation ID",
    });
  });

  test("TC-MHS-04: consultation tidak ditemukan", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Consultation not found",
    });
  });

  test("TC-MHS-05: chat room belum dibuat", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Chat room not found",
    });
  });

  test("TC-MHS-06: chat room inactive", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom({ status: "inactive" }));

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Chat room is not active",
    });
  });

  test("TC-MHS-07: consultation pending", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation("pending"));
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Consultation not active",
    });
  });

  test("TC-MHS-08: consultation rejected", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation("rejected"));
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Consultation not active",
    });
  });

  test("TC-MHS-09: user bukan participant", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom({ participants: [{ toString: () => psikologId }] }));

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 403,
      message: "User not part of chat room",
    });
  });

  test.each([
    ["TC-MHS-10", undefined],
    ["TC-MHS-11", null],
    ["TC-MHS-12", ""],
  ])("%s: message wajib diisi", async (_id, value) => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: value as any })).rejects.toMatchObject({
      statusCode: 400,
      message: "Message is required",
    });
  });

  test("TC-MHS-13: message hanya spasi", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "   " })).rejects.toMatchObject({
      statusCode: 400,
      message: "Message cannot be empty",
    });
  });

  test("TC-MHS-14: message terlalu panjang", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(
      sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "a".repeat(1001) })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Message exceeds maximum length",
    });
  });

  test.each([
    ["TC-MHS-15", "<script>alert(1)</script>"],
    ["TC-MHS-16", "\u0000binary"],
  ])("%s: message invalid", async (_id, value) => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom());

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: value })).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid message content",
    });
  });

  test("TC-MHS-17: DB error saat find consultation", async () => {
    (ConsultationModel.findById as jest.Mock).mockRejectedValue(new Error("db"));

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 500,
      message: "Internal server error",
    });
  });

  test("TC-MHS-18: DB error saat find chatroom", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error("db"));

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 500,
      message: "Internal server error",
    });
  });

  test("TC-MHS-19: DB error saat save message", async () => {
    const room = createRoom({ save: jest.fn().mockRejectedValue(new Error("save")) });
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

    await expect(sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo" })).rejects.toMatchObject({
      statusCode: 500,
      message: "Failed to send message",
    });
  });

  test("TC-MHS-20/21/22: kirim pesan sukses dan field tersimpan lengkap", async () => {
    const room = createRoom();
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

    const result = await sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "halo mahasiswa" });

    expect(result).toMatchObject({
      statusCode: 200,
      message: "Message sent",
      data: {
        message: "halo mahasiswa",
      },
    });
    expect(result.data.senderId).toBeDefined();
    expect(result.data.timestamp).toBeInstanceOf(Date);
    expect(room.messages).toHaveLength(1);
  });

  test("TC-MHS-23: multiple message sequential", async () => {
    const room = createRoom();
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

    await sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "m1" });
    await sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "m2" });
    await sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "m3" });

    expect(room.messages.map((item) => item.message)).toEqual(["m1", "m2", "m3"]);
  });

  test("TC-MHS-24: concurrent message tidak duplicate", async () => {
    const room = createRoom();
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(createConsultation());
    (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

    await Promise.all([
      sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "c1" }),
      sendMessageAsMahasiswa({ userId: mahasiswaId, consultationId, message: "c2" }),
    ]);

    expect(room.messages).toHaveLength(2);
    expect(new Set(room.messages.map((item) => item.message))).toEqual(new Set(["c1", "c2"]));
  });

  test("TC-MHS-25: ambil chat tanpa id", async () => {
    await expect(getChatAsMahasiswa({ userId: mahasiswaId, consultationId: "" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Consultation ID required",
    });
  });

  test("TC-MHS-26: ambil chat tidak ditemukan", async () => {
    (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

    await expect(getChatAsMahasiswa({ userId: mahasiswaId, consultationId: "invalid" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Chat room not found",
    });
  });

  test("TC-MHS-27: ambil chat bukan participant", async () => {
    (chatRoom.findOne as jest.Mock).mockResolvedValue(createRoom({ participants: [{ toString: () => otherUserId }] }));

    await expect(getChatAsMahasiswa({ userId: mahasiswaId, consultationId })).rejects.toMatchObject({
      statusCode: 403,
      message: "Access denied",
    });
  });

  test("TC-MHS-28: ambil chat DB error", async () => {
    (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error("db"));

    await expect(getChatAsMahasiswa({ userId: mahasiswaId, consultationId })).rejects.toMatchObject({
      statusCode: 500,
      message: "Failed to fetch messages",
    });
  });

  test("TC-MHS-29/30: ambil chat sukses dan urutan ascending", async () => {
    const older = new Date("2026-04-16T10:00:00.000Z");
    const newer = new Date("2026-04-16T10:05:00.000Z");

    (chatRoom.findOne as jest.Mock).mockResolvedValue(
      createRoom({
        messages: [
          { senderId: mahasiswaId, message: "new", timestamp: newer },
          { senderId: psikologId, message: "old", timestamp: older },
        ],
      })
    );

    const result = await getChatAsMahasiswa({ userId: mahasiswaId, consultationId });

    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].message).toBe("old");
    expect(result.data[1].message).toBe("new");
  });
});

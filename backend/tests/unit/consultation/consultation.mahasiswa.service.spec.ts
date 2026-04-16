import chatRoom from "../../../src/models/chatRoom";
import { ConsultationModel } from "../../../src/models/consultationModel";
import {
  applyConsultation,
  getConsultationDetail,
  getConsultationList,
  sendMessage,
} from "../../../src/services/consultation.service";

jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

describe("Consultation Service - Mahasiswa", () => {
  const userId = "507f1f77bcf86cd799439011";
  const otherUserId = "507f1f77bcf86cd799439099";
  const psychologistId = "507f1f77bcf86cd799439012";
  const consultationId = "507f1f77bcf86cd799439013";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= APPLY =================

  test("CONS-MHS-01 : Unauthorized", async () => {
    await expect(
      applyConsultation({ userId: undefined, psychologistId, message: "test", role: "mahasiswa" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("CONS-MHS-02 : psychologistId kosong", async () => {
    await expect(applyConsultation({ userId, psychologistId: "", message: "test", role: "mahasiswa" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("CONS-MHS-03 : psychologistId invalid format", async () => {
    await expect(
      applyConsultation({ userId, psychologistId: "invalid", message: "test", role: "mahasiswa" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("CONS-MHS-04 : psychologist not found", async () => {
    (ConsultationModel.db as any) = {
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    };

    await expect(applyConsultation({ userId, psychologistId, message: "test", role: "mahasiswa" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("CONS-MHS-05 : role bukan mahasiswa", async () => {
    await expect(applyConsultation({ userId, psychologistId, message: "test", role: "admin" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test("CONS-MHS-06 : duplicate consultation", async () => {
    (ConsultationModel.db as any) = {
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: "psy" }),
      }),
    };

    (ConsultationModel.findOne as jest.Mock).mockResolvedValue(true);

    await expect(applyConsultation({ userId, psychologistId, message: "test", role: "mahasiswa" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("CONS-MHS-13 : empty message", async () => {
    await expect(applyConsultation({ userId, psychologistId, message: "", role: "mahasiswa" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("CONS-MHS-14 : message too long", async () => {
    await expect(
      applyConsultation({
        userId,
        psychologistId,
        message: "a".repeat(1001),
        role: "mahasiswa",
      })
    ).rejects.toMatchObject({ statusCode: 413 });
  });

  test("CONS-MHS-15 : success create consultation", async () => {
    (ConsultationModel.db as any) = {
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: "psy" }),
      }),
    };

    (ConsultationModel.findOne as jest.Mock).mockResolvedValue(null);
    (ConsultationModel.create as jest.Mock).mockResolvedValue({ _id: "1", status: "pending" });
    (chatRoom.create as jest.Mock).mockResolvedValue({ _id: "2", status: "inactive" });

    const res = await applyConsultation({
      userId,
      psychologistId,
      message: "hi",
      role: "mahasiswa",
    });

    expect(res).toMatchObject({
      statusCode: 201,
      message: "Consultation created",
    });
  });

  // ================= DETAIL =================

  test("CONS-MHS-07 : access other user consultation", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      userId: { toString: () => otherUserId },
    });

    await expect(getConsultationDetail({ userId, consultationId })).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-MHS-08 : invalid consultationId", async () => {
    await expect(getConsultationDetail({ userId, consultationId: "invalid" })).rejects.toMatchObject({ statusCode: 400 });
  });

  test("CONS-MHS-09 : consultation not found", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(getConsultationDetail({ userId, consultationId })).rejects.toMatchObject({ statusCode: 404 });
  });

  // ================= MESSAGE =================

  test("CONS-MHS-10 : send message without login", async () => {
    await expect(sendMessage({ userId: undefined, consultationId, message: "hi" })).rejects.toMatchObject({ statusCode: 401 });
  });

  test("CONS-MHS-11 : send message when pending", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "pending",
      userId: { toString: () => userId },
      psychologistId: { toString: () => userId },
    });

    await expect(sendMessage({ userId, consultationId, message: "hi" })).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-MHS-12 : send message when rejected", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "rejected",
      userId: { toString: () => userId },
      psychologistId: { toString: () => userId },
    });

    await expect(sendMessage({ userId, consultationId, message: "hi" })).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-MHS-18 : send message success", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: { toString: () => userId },
      psychologistId: { toString: () => userId },
    });

    const mockRoom = {
      messages: [],
      save: jest.fn(),
    };

    (chatRoom.findOne as jest.Mock).mockResolvedValue(mockRoom);

    const res = await sendMessage({
      userId,
      consultationId,
      message: "hello",
    });

    expect(res).toMatchObject({
      message: "Message sent",
    });
  });

  // ================= LIST =================

  test("CONS-MHS-16 : get consultation list", async () => {
    (ConsultationModel.find as jest.Mock).mockResolvedValue([]);

    const res = await getConsultationList(userId);

    expect(res).toEqual([]);
  });

  test("CONS-MHS-17 : get consultation detail success", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      userId: { toString: () => userId },
    });

    const res = await getConsultationDetail({ userId, consultationId });

    expect(res).toHaveProperty("userId");
  });
});

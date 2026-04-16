import { sendMessage, updateConsultation, getConsultationList } from "../../../src/services/consultation.service";
import { ConsultationModel } from "../../../src/models/consultationModel";
import chatRoom from "../../../src/models/chatRoom";
import AppError from "../../../src/utils/appError";
import mongoose from "mongoose";

jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

const id = () => new mongoose.Types.ObjectId().toString();
const mockUserId = new mongoose.Types.ObjectId().toString();
const mockPsychologistId = new mongoose.Types.ObjectId().toString();

describe("CONSULTATION PSIKOLOG SERVICE TEST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // NEGATIVE TEST
  // =========================

  test("CONS-PSI-01 tanpa login - should return 401", async () => {
    await expect(sendMessage({ userId: undefined, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-02 role bukan psikolog - should return 403", async () => {
    // ⚠️ service kamu tidak cek role → simulate via owner mismatch
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: mockPsychologistId,
      status: "pending",
      save: jest.fn(),
    });

    await expect(
      updateConsultation({
        psychologistId: "bukan-psi",
        consultationId: id(),
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-03 consultationId invalid - should return 400", async () => {
    await expect(
      updateConsultation({
        psychologistId: "psi",
        consultationId: "invalid",
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-04 consultation tidak ditemukan - should return 404", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      updateConsultation({
        psychologistId: "psi",
        consultationId: id(),
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-05 accept milik psikolog lain - should return 403", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: new mongoose.Types.ObjectId(),
      status: "pending",
      save: jest.fn(),
    });

    await expect(
      updateConsultation({
        psychologistId: mockPsychologistId,
        consultationId: id(),
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-06 reject milik psikolog lain - should return 403", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: new mongoose.Types.ObjectId(),
      status: "pending",
      save: jest.fn(),
    });

    await expect(
      updateConsultation({
        psychologistId: mockPsychologistId,
        consultationId: id(),
        status: "rejected",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-07 accept bukan pending - should return 400", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: mockPsychologistId,
      status: "accepted",
      save: jest.fn(),
    });

    await expect(
      updateConsultation({
        psychologistId: mockPsychologistId,
        consultationId: id(),
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-08 reject bukan pending - should return 400", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: mockPsychologistId,
      status: "rejected",
      save: jest.fn(),
    });

    await expect(
      updateConsultation({
        psychologistId: mockPsychologistId,
        consultationId: id(),
        status: "rejected",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-09 kirim pesan tanpa login - should return 401", async () => {
    await expect(sendMessage({ userId: undefined, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-10 kirim pesan saat pending - should return error", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "pending",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: [mockUserId, mockPsychologistId],
      messages: [],
      save: jest.fn(),
    });

    await expect(sendMessage({ userId: mockUserId, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-11 kirim pesan saat rejected - should return error", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "rejected",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: [mockUserId, mockPsychologistId],
      messages: [],
      save: jest.fn(),
    });

    await expect(sendMessage({ userId: mockUserId, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-12 kirim pesan kosong - should return 400", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: [mockUserId, mockPsychologistId],
      messages: [],
      save: jest.fn(),
    });

    await expect(sendMessage({ userId: mockUserId, consultationId: id(), message: "" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-13 pesan terlalu panjang - should return 413", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: [mockUserId, mockPsychologistId],
      messages: [],
      save: jest.fn(),
    });

    await expect(
      sendMessage({
        userId: mockUserId,
        consultationId: id(),
        message: "a".repeat(2000),
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-14 bukan participant - should return 403", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: ["other"],
      messages: [],
      save: jest.fn(),
    });

    await expect(sendMessage({ userId: mockUserId, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  // =========================
  // POSITIVE TEST
  // =========================

  test("CONS-PSI-15 get list consultation - should return 200", async () => {
    (ConsultationModel.find as jest.Mock).mockResolvedValue([]);

    const res = await getConsultationList(mockUserId);
    expect(res).toEqual([]);
  });

  test("CONS-PSI-16 accept consultation - should update status", async () => {
    const save = jest.fn();

    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: mockPsychologistId,
      status: "pending",
      save,
    });

    const res = await updateConsultation({
      psychologistId: mockPsychologistId,
      consultationId: id(),
      status: "accepted",
    });

    expect(res.status).toBe("accepted");
    expect(save).toHaveBeenCalled();
  });

  test("CONS-PSI-17 reject consultation - should update status", async () => {
    const save = jest.fn();

    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: mockPsychologistId,
      status: "pending",
      save,
    });

    const res = await updateConsultation({
      psychologistId: mockPsychologistId,
      consultationId: id(),
      status: "rejected",
    });

    expect(res.status).toBe("rejected");
    expect(save).toHaveBeenCalled();
  });

  test("CONS-PSI-18 send message accepted - should return 200", async () => {
    const save = jest.fn();

    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: mockUserId,
      psychologistId: mockPsychologistId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "active",
      participants: [mockUserId, mockPsychologistId],
      messages: [],
      save,
    });

    const res = await sendMessage({
      userId: mockUserId,
      consultationId: id(),
      message: "hello",
    });

    expect(res.statusCode).toBe(200);
    expect(res.message).toBe("Message sent");
    expect(save).toHaveBeenCalled();
  });
});

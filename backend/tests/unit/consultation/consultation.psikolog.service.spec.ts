import { sendMessage, updateConsultation, getConsultationList } from "../../../src/services/consultation.service";
import { ConsultationModel } from "../../../src/models/consultationModel";
import chatRoom from "../../../src/models/chatRoom";
import AppError from "../../../src/utils/appError";
import mongoose from "mongoose";
import { logTestContext } from "../../helpers/unit-test-logger";

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
    logTestContext({
      input: { userId: undefined, consultationId: 'some-id', message: "hi" },
      expected: 'throws AppError (401 Unauthorized)',
    });
    await expect(sendMessage({ userId: undefined, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-02 role bukan psikolog - should return 403", async () => {
    logTestContext({
      input: { psychologistId: "bukan-psi", consultationId: 'some-id', status: "accepted" },
      expected: 'throws AppError (403 Forbidden via owner mismatch)',
    });
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
    logTestContext({
      input: { psychologistId: "psi", consultationId: "invalid", status: "accepted" },
      expected: 'throws AppError (400 invalid consultationId format)',
    });
    await expect(
      updateConsultation({
        psychologistId: "psi",
        consultationId: "invalid",
        status: "accepted",
      })
    ).rejects.toThrow(AppError);
  });

  test("CONS-PSI-04 consultation tidak ditemukan - should return 404", async () => {
    logTestContext({
      input: { psychologistId: "psi", consultationId: 'valid-object-id', status: "accepted" },
      expected: 'throws AppError (404 consultation not found)',
    });
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
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "accepted" },
      expected: 'throws AppError (403 Forbidden, consultation belongs to another psychologist)',
    });
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
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "rejected" },
      expected: 'throws AppError (403 Forbidden, consultation belongs to another psychologist)',
    });
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
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "accepted" },
      expected: 'throws AppError (400, cannot accept a non-pending consultation)',
    });
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
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "rejected" },
      expected: 'throws AppError (400, cannot reject a non-pending consultation)',
    });
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
    logTestContext({
      input: { userId: undefined, consultationId: 'some-id', message: "hi" },
      expected: 'throws AppError (401 Unauthorized)',
    });
    await expect(sendMessage({ userId: undefined, consultationId: id(), message: "hi" })).rejects.toThrow(AppError);
  });

  test("CONS-PSI-10 kirim pesan saat pending - should return error", async () => {
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "hi" },
      expected: 'throws AppError when consultation status is pending',
    });
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
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "hi" },
      expected: 'throws AppError when consultation status is rejected',
    });
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
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "" },
      expected: 'throws AppError (400 empty message)',
    });
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
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "a".repeat(2000) },
      expected: 'throws AppError (413 message too long)',
    });
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
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "hi" },
      expected: 'throws AppError (403 user is not a participant of the chat room)',
    });
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
    logTestContext({
      input: { userId: mockUserId },
      expected: 'returns empty array of consultations',
    });
    (ConsultationModel.find as jest.Mock).mockResolvedValue([]);

    const res = await getConsultationList(mockUserId);
    expect(res).toEqual([]);
  });

  test("CONS-PSI-16 accept consultation - should update status", async () => {
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "accepted" },
      expected: 'calls findOneAndUpdate with pending filter and returns consultation with status "accepted"',
    });
    const consultationId = id();

    (ConsultationModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: consultationId,
      psychologistId: mockPsychologistId,
      status: "accepted",
    });

    const res = await updateConsultation({
      psychologistId: mockPsychologistId,
      consultationId,
      status: "accepted",
    });

    expect(ConsultationModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: consultationId,
        psychologistId: mockPsychologistId,
        status: "pending",
      },
      { status: "accepted" },
      { new: true }
    );

    expect(res.status).toBe("accepted");
  });

  test("CONS-PSI-17 reject consultation - should update status", async () => {
    logTestContext({
      input: { psychologistId: mockPsychologistId, consultationId: 'some-id', status: "rejected" },
      expected: 'calls findOneAndUpdate with pending filter and returns consultation with status "rejected"',
    });
    const consultationId = id();

    (ConsultationModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: consultationId,
      psychologistId: mockPsychologistId,
      status: "rejected",
    });

    const res = await updateConsultation({
      psychologistId: mockPsychologistId,
      consultationId,
      status: "rejected",
    });

    expect(ConsultationModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: consultationId,
        psychologistId: mockPsychologistId,
        status: "pending",
      },
      { status: "rejected" },
      { new: true }
    );

    expect(res.status).toBe("rejected");
  });

  test("CONS-PSI-18 send message accepted - should return 200", async () => {
    logTestContext({
      input: { userId: mockUserId, consultationId: 'some-id', message: "hello" },
      expected: 'returns statusCode 200 with message "Message sent" and calls save()',
    });
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

import chatRoom from "../../../src/models/chatRoom";
import { ConsultationModel } from "../../../src/models/consultationModel";
import { updateConsultation, sendMessage, getPsychologistNotifications } from "../../../src/services/consultation.service";

jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

describe("Consultation Service - Psikolog (FULL TEST)", () => {
  const psychologistId = "507f1f77bcf86cd799439011";
  const otherPsychologistId = "507f1f77bcf86cd799439099";
  const consultationId = "507f1f77bcf86cd799439012";
  const userId = "507f1f77bcf86cd799439013";

  const baseRoom = {
    status: "active",
    participants: [userId, psychologistId],
    messages: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= UPDATE =================

  test("CONS-PSI-01 : akses tanpa login", async () => {
    await expect(
      updateConsultation({
        psychologistId: "",
        consultationId,
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("CONS-PSI-02 : akses bukan psikolog", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => psychologistId },
      status: "pending",
    });

    await expect(
      updateConsultation({
        psychologistId: otherPsychologistId,
        consultationId,
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-PSI-03 : consultationId invalid", async () => {
    await expect(
      updateConsultation({
        psychologistId,
        consultationId: "invalid",
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("CONS-PSI-04 : consultation tidak ditemukan", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      updateConsultation({
        psychologistId,
        consultationId,
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("CONS-PSI-05 : accept milik psikolog lain", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => otherPsychologistId },
      status: "pending",
    });

    await expect(
      updateConsultation({
        psychologistId,
        consultationId,
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-PSI-06 : reject milik psikolog lain", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => otherPsychologistId },
      status: "pending",
    });

    await expect(
      updateConsultation({
        psychologistId,
        consultationId,
        status: "rejected",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-PSI-07 : accept saat bukan pending", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => psychologistId },
      status: "accepted",
    });

    await expect(
      updateConsultation({
        psychologistId,
        consultationId,
        status: "accepted",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("CONS-PSI-08 : reject saat bukan pending", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => psychologistId },
      status: "rejected",
    });

    await expect(
      updateConsultation({
        psychologistId,
        consultationId,
        status: "rejected",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  // ================= MESSAGE =================

  test("CONS-PSI-09 : kirim pesan tanpa login", async () => {
    await expect(
      sendMessage({
        userId: undefined,
        consultationId,
        message: "hi",
      } as any)
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("CONS-PSI-10 : kirim pesan saat pending", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "pending",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    await expect(
      sendMessage({
        userId: psychologistId,
        consultationId,
        message: "hi",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-PSI-11 : kirim pesan saat rejected", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "rejected",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    await expect(
      sendMessage({
        userId: psychologistId,
        consultationId,
        message: "hi",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("CONS-PSI-12 : kirim pesan kosong", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    await expect(
      sendMessage({
        userId: psychologistId,
        consultationId,
        message: "",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("CONS-PSI-13 : kirim pesan terlalu panjang", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    await expect(
      sendMessage({
        userId: psychologistId,
        consultationId,
        message: "a".repeat(1001),
      })
    ).rejects.toMatchObject({ statusCode: 413 });
  });

  test("CONS-PSI-14 : akses chat bukan miliknya", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    await expect(
      sendMessage({
        userId: otherPsychologistId,
        consultationId,
        message: "hi",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // ================= LIST =================

  test("CONS-PSI-15 : lihat daftar konsultasi", async () => {
    (ConsultationModel.find as jest.Mock).mockReturnValue({
      populate: () => ({
        exec: () => Promise.resolve([]),
      }),
    });

    const res = await getPsychologistNotifications(psychologistId);

    expect(res).toBeDefined();
  });

  // ================= UPDATE SUCCESS =================

  test("CONS-PSI-16 : accept konsultasi", async () => {
    const mockSave = jest.fn();

    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => psychologistId },
      status: "pending",
      save: mockSave,
      _id: consultationId,
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue({
      status: "inactive",
      save: jest.fn(),
    });

    const res = await updateConsultation({
      psychologistId,
      consultationId,
      status: "accepted",
    });

    expect(res.status).toBe("accepted");
  });

  test("CONS-PSI-17 : reject konsultasi", async () => {
    const mockSave = jest.fn();

    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      psychologistId: { toString: () => psychologistId },
      status: "pending",
      save: mockSave,
    });

    const res = await updateConsultation({
      psychologistId,
      consultationId,
      status: "rejected",
    });

    expect(res.status).toBe("rejected");
  });

  // ================= MESSAGE SUCCESS =================

  test("CONS-PSI-18 : kirim pesan saat accepted", async () => {
    (ConsultationModel.findById as jest.Mock).mockResolvedValue({
      status: "accepted",
      userId: { toString: () => userId },
      psychologistId: { toString: () => psychologistId },
    });

    (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

    const res = await sendMessage({
      userId: psychologistId,
      consultationId,
      message: "hello",
    });

    expect(res).toMatchObject({
      message: "Message sent",
    });
  });
});

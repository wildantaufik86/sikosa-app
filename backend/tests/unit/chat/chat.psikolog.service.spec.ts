import mongoose from "mongoose";
import { getChatAsPsychologist, sendMessageAsPsychologist } from "../../../src/services/consultation.service";
import chatRoom from "../../../src/models/chatRoom";
import { ConsultationModel } from "../../../src/models/consultationModel";
import { ERROR_MSG } from "../../../src/constants/errorMessage";
import { logTestContext } from "../../helpers/unit-test-logger";

jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

describe("Consultation Service - Psychologist Chat", () => {
  const validUserId = new mongoose.Types.ObjectId().toString();
  const validConsultationId = new mongoose.Types.ObjectId().toString();

  const baseConsultation = {
    _id: validConsultationId,
    psychologistId: new mongoose.Types.ObjectId(validUserId),
    userId: new mongoose.Types.ObjectId(),
    status: "accepted",
  };

  const baseRoom = {
    consultationId: validConsultationId,
    participants: [validUserId],
    messages: [],
    status: "active",
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // sendMessageAsPsychologist
  // =============================
  describe("sendMessageAsPsychologist", () => {
    test("[TC-PSI-01] : Kirim pesan tanpa userId - return 401 Unauthorized", async () => {
      logTestContext({
        input: { userId: undefined, consultationId: validConsultationId, message: "hi" },
        expected: 'throws UNAUTHORIZED error',
      });
      await expect(
        sendMessageAsPsychologist({ userId: undefined, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.UNAUTHORIZED);
    });

    test("[TC-PSI-02] : consultationId kosong - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: "", message: "hi" },
        expected: 'throws REQUIRED_CONSULTATION_ID error',
      });
      await expect(sendMessageAsPsychologist({ userId: validUserId, consultationId: "" as any, message: "hi" })).rejects.toThrow(
        ERROR_MSG.REQUIRED_CONSULTATION_ID
      );
    });

    test("[TC-PSI-03] : consultationId tidak valid - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: "invalid-id", message: "hi" },
        expected: 'throws INVALID_ID error',
      });
      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: "invalid-id", message: "hi" })
      ).rejects.toThrow(ERROR_MSG.INVALID_ID);
    });

    test("[TC-PSI-04] : Consultation tidak ditemukan - return 404", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws CONSULTATION_NOT_FOUND error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.CONSULTATION_NOT_FOUND);
    });

    test("[TC-PSI-05] : ChatRoom tidak ditemukan - return 404", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws CHAT_ROOM_NOT_FOUND error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.CHAT_ROOM_NOT_FOUND);
    });

    test("[TC-PSI-06] : ChatRoom inactive - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws CHAT_ROOM_INACTIVE error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({ ...baseRoom, status: "inactive" });

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.CHAT_ROOM_INACTIVE);
    });

    test("[TC-PSI-07] : Consultation pending - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws CONSULTATION_NOT_ACTIVE error (status is pending)',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({ ...baseConsultation, status: "pending" });
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.CONSULTATION_NOT_ACTIVE);
    });

    test("[TC-PSI-08] : Consultation rejected - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws CONSULTATION_NOT_ACTIVE error (status is rejected)',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({ ...baseConsultation, status: "rejected" });
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.CONSULTATION_NOT_ACTIVE);
    });

    test("[TC-PSI-09] : Psikolog bukan assigned - return 403", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws "Not authorized for this consultation" error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        ...baseConsultation,
        psychologistId: new mongoose.Types.ObjectId(),
      });

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow("Not authorized for this consultation");
    });

    test("[TC-PSI-10] : message undefined - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: undefined },
        expected: 'throws MESSAGE_REQUIRED error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({
          userId: validUserId,
          consultationId: validConsultationId,
          message: undefined as any,
        })
      ).rejects.toThrow(ERROR_MSG.MESSAGE_REQUIRED);
    });

    test("[TC-PSI-11] : message null - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: null },
        expected: 'throws MESSAGE_REQUIRED error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({
          userId: validUserId,
          consultationId: validConsultationId,
          message: null as any,
        })
      ).rejects.toThrow(ERROR_MSG.MESSAGE_REQUIRED);
    });

    test("[TC-PSI-12] : message kosong - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "" },
        expected: 'throws MESSAGE_REQUIRED error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "" })
      ).rejects.toThrow(ERROR_MSG.MESSAGE_REQUIRED);
    });

    test("[TC-PSI-13] : message hanya spasi - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "   " },
        expected: 'throws MESSAGE_REQUIRED error (whitespace-only message)',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "   " })
      ).rejects.toThrow(ERROR_MSG.MESSAGE_REQUIRED);
    });

    test("[TC-PSI-14] : message terlalu panjang - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "a".repeat(1001) },
        expected: 'throws MESSAGE_TOO_LONG error',
      });
      const longMessage = "a".repeat(1001);

      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: longMessage })
      ).rejects.toThrow(ERROR_MSG.MESSAGE_TOO_LONG);
    });

    test("[TC-PSI-15] : message mengandung script - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "<script>" },
        expected: 'throws INVALID_MESSAGE_CONTENT error',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "<script>" })
      ).rejects.toThrow(ERROR_MSG.INVALID_MESSAGE_CONTENT);
    });

    test("[TC-PSI-16] : error saat find consultation - return 500", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws INTERNAL_SERVER_ERROR when findById rejects',
      });
      (ConsultationModel.findById as jest.Mock).mockRejectedValue(new Error());

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.INTERNAL_SERVER_ERROR);
    });

    test("[TC-PSI-17] : error saat find chatroom - return 500", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws INTERNAL_SERVER_ERROR when chatRoom.findOne rejects',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error());

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.INTERNAL_SERVER_ERROR);
    });

    test("[TC-PSI-18] : error saat save message - return 500", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hi" },
        expected: 'throws FAILED_SEND_MESSAGE when save() rejects',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        ...baseRoom,
        save: jest.fn().mockRejectedValue(new Error()),
      });

      await expect(
        sendMessageAsPsychologist({ userId: validUserId, consultationId: validConsultationId, message: "hi" })
      ).rejects.toThrow(ERROR_MSG.FAILED_SEND_MESSAGE);
    });

    test("[TC-PSI-19] : Kirim pesan berhasil - return 200", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hello" },
        expected: 'returns statusCode 200 and res.data.message is "hello"',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const result = await sendMessageAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
        message: "hello",
      });

      expect(result.statusCode).toBe(200);
      expect(result.data.message).toBe("hello");
    });

    test("[TC-PSI-20] : Validasi field message tersimpan - contains senderId, message, timestamp", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hello" },
        expected: 'returns res.data with senderId, message, and timestamp properties',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const result = await sendMessageAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
        message: "hello",
      });

      expect(result.data).toHaveProperty("senderId");
      expect(result.data).toHaveProperty("message");
      expect(result.data).toHaveProperty("timestamp");
    });

    test("[TC-PSI-21] : Timestamp otomatis dibuat - valid Date", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId, message: "hello" },
        expected: 'returns res.data.timestamp as instance of Date',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const result = await sendMessageAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
        message: "hello",
      });

      expect(result.data.timestamp).toBeInstanceOf(Date);
    });
  });

  // =============================
  // getChatAsPsychologist
  // =============================
  describe("getChatAsPsychologist", () => {
    test("[TC-PSI-22] : Ambil chat tanpa consultationId - return 400", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: undefined },
        expected: 'throws REQUIRED_CONSULTATION_ID error',
      });
      await expect(getChatAsPsychologist({ userId: validUserId, consultationId: undefined as any })).rejects.toThrow(
        ERROR_MSG.REQUIRED_CONSULTATION_ID
      );
    });

    test("[TC-PSI-23] : ChatRoom tidak ditemukan - return 404", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'throws CHAT_ROOM_NOT_FOUND error',
      });
      (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

      await expect(getChatAsPsychologist({ userId: validUserId, consultationId: validConsultationId })).rejects.toThrow(
        ERROR_MSG.CHAT_ROOM_NOT_FOUND
      );
    });

    test("[TC-PSI-24] : Bukan participant - return 403", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'throws FORBIDDEN error (user is not a participant)',
      });
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        participants: [],
        messages: [],
      });

      await expect(getChatAsPsychologist({ userId: validUserId, consultationId: validConsultationId })).rejects.toThrow(
        ERROR_MSG.FORBIDDEN
      );
    });

    test("[TC-PSI-25] : error saat fetch chat - return 500", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'throws FAILED_FETCH_MESSAGES when findOne rejects',
      });
      (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error());

      await expect(getChatAsPsychologist({ userId: validUserId, consultationId: validConsultationId })).rejects.toThrow(
        ERROR_MSG.FAILED_FETCH_MESSAGES
      );
    });

    test("[TC-PSI-26] : Ambil chat berhasil - return 200", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'returns statusCode 200 and res.data has at least 1 message',
      });
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        participants: [validUserId],
        messages: [{ message: "hi", timestamp: new Date() }],
      });

      const result = await getChatAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
      });

      expect(result.statusCode).toBe(200);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test("[TC-PSI-27] : Validasi struktur message - contains senderId, message, timestamp", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'returns res.data[0] with senderId, message, and timestamp properties',
      });
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        participants: [validUserId],
        messages: [
          {
            senderId: new mongoose.Types.ObjectId(),
            message: "hi",
            timestamp: new Date(),
          },
        ],
      });

      const result = await getChatAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
      });

      expect(result.data[0]).toHaveProperty("senderId");
      expect(result.data[0]).toHaveProperty("message");
      expect(result.data[0]).toHaveProperty("timestamp");
    });

    test("[TC-PSI-28] : Urutan pesan ascending - sorted by timestamp asc", async () => {
      logTestContext({
        input: { userId: validUserId, consultationId: validConsultationId },
        expected: 'returns messages sorted ascending by timestamp (["early", "late"])',
      });
      const messages = [
        { message: "late", timestamp: new Date("2024-01-02") },
        { message: "early", timestamp: new Date("2024-01-01") },
      ];

      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        participants: [validUserId],
        messages,
      });

      const result = await getChatAsPsychologist({
        userId: validUserId,
        consultationId: validConsultationId,
      });

      expect(result.data.map((m: any) => m.message)).toEqual(["early", "late"]);
    });
  });
});

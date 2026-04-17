import mongoose from "mongoose";
import chatRoom from "../../../src/models/chatRoom";
import { ConsultationModel } from "../../../src/models/consultationModel";
import { getChatAsMahasiswa, sendMessageAsMahasiswa } from "../../../src/services/consultation.service";
import { ERROR_MSG } from "../../../src/constants/errorMessage";

// ✅ explicit mock
jest.mock("../../../src/models/chatRoom", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock("../../../src/models/consultationModel", () => ({
  ConsultationModel: {
    findById: jest.fn(),
  },
}));

const userId = new mongoose.Types.ObjectId().toString();
const consultationId = new mongoose.Types.ObjectId().toString();

const baseConsultation = {
  _id: consultationId,
  userId: new mongoose.Types.ObjectId(userId),
  psychologistId: new mongoose.Types.ObjectId(),
  status: "accepted",
};

const baseRoom = {
  consultationId,
  participants: [new mongoose.Types.ObjectId(userId)],
  messages: [],
  status: "active",
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Chat/Consultation service - Mahasiswa", () => {
  describe("sendMessageAsMahasiswa", () => {
    test("[TC-MHS-01] : tanpa userId - Unauthorized access", async () => {
      await expect(sendMessageAsMahasiswa({ userId: undefined, consultationId, message: "hi" })).rejects.toThrow(
        ERROR_MSG.UNAUTHORIZED
      );
    });

    test("[TC-MHS-02] : consultationId kosong - Consultation ID required", async () => {
      await expect(sendMessageAsMahasiswa({ userId, consultationId: "", message: "hi" })).rejects.toThrow(
        "Consultation ID required"
      );
    });

    test("[TC-MHS-03] : consultationId invalid - Invalid consultation ID", async () => {
      await expect(sendMessageAsMahasiswa({ userId, consultationId: "invalid", message: "hi" })).rejects.toThrow(
        "Invalid consultation ID"
      );
    });

    test("[TC-MHS-04] : consultation tidak ditemukan - Consultation not found", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Consultation not found");
    });

    test("[TC-MHS-05] : chatroom tidak ditemukan - Chat room not found", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Chat room not found");
    });

    test("[TC-MHS-06] : chatroom inactive - Chat room is not active", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({ ...baseRoom, status: "inactive" });

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Chat room is not active");
    });

    test("[TC-MHS-07] : consultation pending - Consultation not active", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({ ...baseConsultation, status: "pending" });
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow(
        ERROR_MSG.CONSULTATION_NOT_ACTIVE
      );
    });

    test("[TC-MHS-08] : consultation rejected - Consultation not active", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({ ...baseConsultation, status: "rejected" });
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow(
        ERROR_MSG.CONSULTATION_NOT_ACTIVE
      );
    });

    test("[TC-MHS-09] : bukan participant - User not part of chat room", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        ...baseRoom,
        participants: [new mongoose.Types.ObjectId()],
      });

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow(ERROR_MSG.NOT_PARTICIPANT);
    });

    test("[TC-MHS-10] : message undefined - Message cannot be empty", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: undefined as any })).rejects.toThrow(
        ERROR_MSG.EMPTY_MESSAGE
      );
    });

    test("[TC-MHS-11] : message null - Message cannot be empty", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: null as any })).rejects.toThrow(
        ERROR_MSG.EMPTY_MESSAGE
      );
    });

    test("[TC-MHS-12] : message kosong - Message cannot be empty", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "" })).rejects.toThrow(ERROR_MSG.EMPTY_MESSAGE);
    });

    test("[TC-MHS-13] : message spasi - Message cannot be empty", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "   " })).rejects.toThrow(ERROR_MSG.EMPTY_MESSAGE);
    });

    test("[TC-MHS-14] : message terlalu panjang - Message too long", async () => {
      const longMsg = "a".repeat(1001);

      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: longMsg })).rejects.toThrow(
        ERROR_MSG.MESSAGE_TOO_LONG
      );
    });

    test("[TC-MHS-15] : message invalid content - Invalid message content", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "<script>" })).rejects.toThrow(
        "Invalid message content"
      );
    });

    test("[TC-MHS-16] : error find consultation - Internal server error", async () => {
      (ConsultationModel.findById as jest.Mock).mockRejectedValue(new Error());

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Internal server error");
    });

    test("[TC-MHS-17] : error find chatroom - Internal server error", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error());

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Internal server error");
    });

    test("[TC-MHS-18] : error save message - Failed to send message", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        ...baseRoom,
        save: jest.fn().mockRejectedValue(new Error()),
      });

      await expect(sendMessageAsMahasiswa({ userId, consultationId, message: "hi" })).rejects.toThrow("Failed to send message");
    });

    test("[TC-MHS-19] : sukses - message tersimpan", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);

      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue({ ...baseRoom, save: saveMock });

      const res = await sendMessageAsMahasiswa({ userId, consultationId, message: "hello" });

      expect(res.statusCode).toBe(200);
      expect(res.data.message).toBe("hello");
    });

    test("[TC-MHS-20] : validasi field - senderId, message, timestamp ada", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const res = await sendMessageAsMahasiswa({ userId, consultationId, message: "hi" });

      expect(res.data).toHaveProperty("senderId");
      expect(res.data).toHaveProperty("message");
      expect(res.data).toHaveProperty("timestamp");
    });

    test("[TC-MHS-21] : timestamp otomatis - valid Date", async () => {
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(baseConsultation);
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const res = await sendMessageAsMahasiswa({ userId, consultationId, message: "hi" });

      expect(res.data.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("getChatAsMahasiswa", () => {
    test("[TC-MHS-22] : tanpa id - Consultation ID required", async () => {
      await expect(getChatAsMahasiswa({ userId, consultationId: "" })).rejects.toThrow("Consultation ID required");
    });

    test("[TC-MHS-23] : chatroom tidak ditemukan - Chat room not found", async () => {
      (chatRoom.findOne as jest.Mock).mockResolvedValue(null);

      await expect(getChatAsMahasiswa({ userId, consultationId })).rejects.toThrow("Chat room not found");
    });

    test("[TC-MHS-24] : bukan participant - Access denied", async () => {
      (chatRoom.findOne as jest.Mock).mockResolvedValue({
        ...baseRoom,
        participants: [new mongoose.Types.ObjectId()],
      });

      await expect(getChatAsMahasiswa({ userId, consultationId })).rejects.toThrow(ERROR_MSG.FORBIDDEN);
    });

    test("[TC-MHS-25] : error fetch - Failed to fetch messages", async () => {
      (chatRoom.findOne as jest.Mock).mockRejectedValue(new Error());

      await expect(getChatAsMahasiswa({ userId, consultationId })).rejects.toThrow("Failed to fetch messages");
    });

    test("[TC-MHS-26] : sukses - return array messages", async () => {
      (chatRoom.findOne as jest.Mock).mockResolvedValue(baseRoom);

      const res = await getChatAsMahasiswa({ userId, consultationId });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    test("[TC-MHS-27] : urutan ascending - sorted by timestamp", async () => {
      const room = {
        ...baseRoom,
        messages: [
          { message: "2", timestamp: new Date("2024-01-02") },
          { message: "1", timestamp: new Date("2024-01-01") },
        ],
      };

      (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

      const res = await getChatAsMahasiswa({ userId, consultationId });

      expect(res.data[0].message).toBe("1");
    });
  });
});

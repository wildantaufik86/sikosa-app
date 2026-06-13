import mongoose from "mongoose";
import {
  applyConsultation,
  getConsultationDetail,
  getConsultationList,
  sendMessage,
} from "../../../src/services/consultation.service";

import { ConsultationModel } from "../../../src/models/consultationModel";
import chatRoom from "../../../src/models/chatRoom";
import AppError from "../../../src/utils/appError";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND, OK, TO_LARGE, UNAUTHORIZED } from "../../../src/constants/http";
import { ERROR_MSG } from "../../../src/constants/errorMessage";
import { logTestContext } from "../../helpers/unit-test-logger";

/**
 * =========================
 * MOCK MODELS
 * =========================
 */
jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/models/chatRoom");

/**
 * =========================
 * MOCK USERS COLLECTION
 * =========================
 */
const mockUsersCollection = {
  findOne: jest.fn(),
};

(ConsultationModel as any).db = {
  collection: jest.fn(() => mockUsersCollection),
};

/**
 * =========================
 * HELPERS
 * =========================
 */
const createObjectId = () => new mongoose.Types.ObjectId().toString();

const mockConsultation = (overrides = {}) => ({
  _id: createObjectId(),
  userId: createObjectId(),
  psychologistId: createObjectId(),
  status: "pending",
  save: jest.fn(),
  ...overrides,
});

const mockRoom = (overrides = {}) => ({
  consultationId: createObjectId(),
  participants: [],
  messages: [],
  status: "inactive",
  save: jest.fn(),
  ...overrides,
});

const expectAppError = async (fn: any, status: number, message: string) => {
  try {
    await fn();
  } catch (err: any) {
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(status);
    expect(err.message).toBe(message);
  }
};

describe("CONSULTATION SERVICE - MAHASISWA FLOW", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================
   * APPLY CONSULTATION
   * =========================
   */
  describe("applyConsultation", () => {
    test("CONS-MHS-01 tanpa login - should return 401", async () => {
      logTestContext({
        input: { userId: undefined, psychologistId: 'some-id', message: "test", role: "mahasiswa" },
        expected: 'throws AppError with status 401 Unauthorized access',
      });
      await expectAppError(
        () =>
          applyConsultation({
            userId: undefined,
            psychologistId: createObjectId(),
            message: "test",
            role: "mahasiswa",
          }),
        UNAUTHORIZED,
        "Unauthorized access"
      );
    });

    test("CONS-MHS-02 psychologistId kosong - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: "", message: "test", role: "mahasiswa" },
        expected: 'throws AppError with status 400 "psychologistId is required"',
      });
      await expectAppError(
        () =>
          applyConsultation({
            userId: createObjectId(),
            psychologistId: "" as any,
            message: "test",
            role: "mahasiswa",
          }),
        BAD_REQUEST,
        "psychologistId is required"
      );
    });

    test("CONS-MHS-03 psychologistId invalid - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: "invalid-id", message: "test", role: "mahasiswa" },
        expected: 'throws AppError with status 400 "Invalid psychologistId format"',
      });
      await expectAppError(
        () =>
          applyConsultation({
            userId: createObjectId(),
            psychologistId: "invalid-id",
            message: "test",
            role: "mahasiswa",
          }),
        BAD_REQUEST,
        "Invalid psychologistId format"
      );
    });

    test("CONS-MHS-04 psychologist tidak ditemukan - should return 404", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: 'valid-object-id', message: "test", role: "mahasiswa" },
        expected: 'throws AppError with status 404 "Psychologist not found"',
      });
      mockUsersCollection.findOne.mockResolvedValue(null);

      await expectAppError(
        () =>
          applyConsultation({
            userId: createObjectId(),
            psychologistId: createObjectId(),
            message: "test",
            role: "mahasiswa",
          }),
        NOT_FOUND,
        "Psychologist not found"
      );
    });

    test("CONS-MHS-05 role bukan mahasiswa - should return 403", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: 'valid-object-id', message: "test", role: "psikolog" },
        expected: 'throws AppError with status 403 "Only mahasiswa allowed"',
      });
      await expectAppError(
        () =>
          applyConsultation({
            userId: createObjectId(),
            psychologistId: createObjectId(),
            message: "test",
            role: "psikolog",
          }),
        FORBIDDEN,
        "Only mahasiswa allowed"
      );
    });

    test("CONS-MHS-06 duplicate consultation - should return 409", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: 'valid-object-id', message: "test", role: "mahasiswa" },
        expected: 'throws AppError with status 409 "Consultation already exists"',
      });
      (ConsultationModel.findOne as jest.Mock).mockResolvedValue({ _id: "exist" });

      mockUsersCollection.findOne.mockResolvedValue({ _id: createObjectId() });

      await expectAppError(
        () =>
          applyConsultation({
            userId: createObjectId(),
            psychologistId: createObjectId(),
            message: "test",
            role: "mahasiswa",
          }),
        CONFLICT,
        "Consultation already exists"
      );
    });

    test("CONS-MHS-15 create consultation sukses - should return 201", async () => {
      logTestContext({
        input: { userId: 'some-id', psychologistId: 'valid-object-id', message: "halo", role: "mahasiswa" },
        expected: 'returns statusCode 201 with message "Consultation created"',
      });
      (ConsultationModel.findOne as jest.Mock).mockResolvedValue(null);

      mockUsersCollection.findOne.mockResolvedValue({ _id: createObjectId() });

      (ConsultationModel.create as jest.Mock).mockResolvedValue({
        _id: createObjectId(),
      });

      (chatRoom.create as jest.Mock).mockResolvedValue({});

      const result = await applyConsultation({
        userId: createObjectId(),
        psychologistId: createObjectId(),
        message: "halo",
        role: "mahasiswa",
      });

      expect(result.statusCode).toBe(201);
      expect(result.message).toBe("Consultation created");
    });
  });

  /**
   * =========================
   * GET CONSULTATION
   * =========================
   */
  describe("getConsultationDetail & List", () => {
    test("CONS-MHS-07 akses milik orang lain - should return 403", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-consultation-id' },
        expected: 'throws AppError with status 403 "Access denied"',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: createObjectId(),
        psychologistId: createObjectId(),
      });

      await expectAppError(
        () =>
          getConsultationDetail({
            userId: createObjectId(),
            consultationId: createObjectId(),
          }),
        FORBIDDEN,
        "Access denied"
      );
    });

    test("CONS-MHS-08 consultationId invalid - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: "invalid" },
        expected: 'throws AppError with status 400 "Invalid consultationId"',
      });
      await expectAppError(
        () =>
          getConsultationDetail({
            userId: createObjectId(),
            consultationId: "invalid",
          }),
        BAD_REQUEST,
        "Invalid consultationId"
      );
    });

    test("CONS-MHS-09 consultation tidak ditemukan - should return 404", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'valid-object-id' },
        expected: 'throws AppError with status 404 "Consultation not found"',
      });
      (ConsultationModel.findById as jest.Mock).mockResolvedValue(null);

      await expectAppError(
        () =>
          getConsultationDetail({
            userId: createObjectId(),
            consultationId: createObjectId(),
          }),
        NOT_FOUND,
        "Consultation not found"
      );
    });

    test("CONS-MHS-16 get list consultation - should return data", async () => {
      logTestContext({
        input: { userId: 'some-id' },
        expected: 'returns array of length 1',
      });
      (ConsultationModel.find as jest.Mock).mockResolvedValue([{ _id: "1" }]);

      const result = await getConsultationList(createObjectId());
      expect(result.length).toBe(1);
    });

    test("CONS-MHS-17 get detail consultation - should return data", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'valid-object-id' },
        expected: 'returns defined consultation detail object',
      });
      const uid = createObjectId();

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: createObjectId(),
      });

      const result = await getConsultationDetail({
        userId: uid,
        consultationId: createObjectId(),
      });

      expect(result).toBeDefined();
    });
  });

  /**
   * =========================
   * SEND MESSAGE
   * =========================
   */
  describe("sendMessage", () => {
    test("CONS-MHS-10 tanpa login - should return 401", async () => {
      logTestContext({
        input: { userId: undefined, consultationId: 'some-id', message: "halo" },
        expected: 'throws AppError with status 401 Unauthorized access',
      });
      await expectAppError(
        () =>
          sendMessage({
            userId: undefined,
            consultationId: createObjectId(),
            message: "halo",
          }),
        UNAUTHORIZED,
        "Unauthorized access"
      );
    });

    test("CONS-MHS-11 status pending - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-id', message: "hi" },
        expected: 'throws AppError with status 400 "Consultation not active" (status is pending)',
      });
      const uid = createObjectId();

      (chatRoom.findOne as jest.Mock).mockResolvedValue(mockRoom({ status: "active", participants: [uid] }));

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: createObjectId(),
        status: "pending",
      });

      await expectAppError(
        () =>
          sendMessage({
            userId: uid,
            consultationId: createObjectId(),
            message: "hi",
          }),
        BAD_REQUEST,
        "Consultation not active"
      );
    });

    test("CONS-MHS-12 status rejected - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-id', message: "hi" },
        expected: 'throws AppError with status 400 "Consultation not active" (status is rejected)',
      });
      const uid = createObjectId();

      (chatRoom.findOne as jest.Mock).mockResolvedValue(mockRoom({ status: "active", participants: [uid] }));

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: createObjectId(),
        status: "rejected",
      });

      await expectAppError(
        () =>
          sendMessage({
            userId: uid,
            consultationId: createObjectId(),
            message: "hi",
          }),
        BAD_REQUEST,
        "Consultation not active"
      );
    });

    test("CONS-MHS-13 message kosong - should return 400", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-id', message: "" },
        expected: 'throws AppError with status 400 EMPTY_MESSAGE',
      });
      const uid = createObjectId();

      (chatRoom.findOne as jest.Mock).mockResolvedValue(mockRoom({ status: "active", participants: [uid] }));

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: createObjectId(),
        status: "accepted",
      });

      await expectAppError(
        () =>
          sendMessage({
            userId: uid,
            consultationId: createObjectId(),
            message: "",
          }),
        BAD_REQUEST,
        ERROR_MSG.EMPTY_MESSAGE
      );
    });

    test("CONS-MHS-14 message terlalu panjang - should return 413", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-id', message: "a".repeat(2000) },
        expected: 'throws AppError with status 413 MESSAGE_TOO_LONG',
      });
      const uid = createObjectId();

      (chatRoom.findOne as jest.Mock).mockResolvedValue(mockRoom({ status: "active", participants: [uid] }));

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: createObjectId(),
        status: "accepted",
      });

      await expectAppError(
        () =>
          sendMessage({
            userId: uid,
            consultationId: createObjectId(),
            message: "a".repeat(2000),
          }),
        TO_LARGE,
        ERROR_MSG.MESSAGE_TOO_LONG
      );
    });

    test("CONS-MHS-18 send message sukses - should return 200", async () => {
      logTestContext({
        input: { userId: 'some-id', consultationId: 'some-id', message: "halo" },
        expected: 'returns statusCode 200 and room.messages.length becomes 1',
      });
      const uid = createObjectId();
      const pid = createObjectId();

      const room = mockRoom({
        status: "active",
        participants: [uid, pid],
      });

      (chatRoom.findOne as jest.Mock).mockResolvedValue(room);

      (ConsultationModel.findById as jest.Mock).mockResolvedValue({
        userId: uid,
        psychologistId: pid,
        status: "accepted",
      });

      const result = await sendMessage({
        userId: uid,
        consultationId: createObjectId(),
        message: "halo",
      });

      expect(result.statusCode).toBe(OK);
      expect(room.messages.length).toBe(1);
    });
  });
});

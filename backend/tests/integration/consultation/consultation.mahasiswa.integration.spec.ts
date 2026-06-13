import mongoose from "mongoose";
import { signToken } from "../../../src/utils/jwt";
import UserModel from "../../../src/models/userModel";
import { ConsultationModel } from "../../../src/models/consultationModel";
import SessionModel from "../../../src/models/sessionModel";
import { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED, CONFLICT, TO_LARGE } from "../../../src/constants/http";
import chatRoom from "../../../src/models/chatRoom";
import { apiTest } from "../../setup/apiTest";

jest.setTimeout(20000);

let mahasiswaToken: string;
let psikologToken: string;
let mahasiswaId: mongoose.Types.ObjectId;
let psikologId: mongoose.Types.ObjectId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);

  // create mahasiswa
  const mahasiswa = await UserModel.create({
    email: `mahasiswa_${Date.now()}@test.com`,
    password: "password",
    role: "mahasiswa",
    verified: true,
  });

  mahasiswaId = mahasiswa._id as mongoose.Types.ObjectId;

  const mhsSession = await SessionModel.create({
    userId: mahasiswaId,
  });

  mahasiswaToken = signToken({
    userId: mahasiswaId,
    sessionId: mhsSession._id,
  });

  // create psikolog
  const psikolog = await UserModel.create({
    email: `psikolog_cons_${Date.now()}@test.com`,
    password: "password",
    role: "psikolog",
    verified: true,
  });

  psikologId = psikolog._id as mongoose.Types.ObjectId;

  const psySession = await SessionModel.create({
    userId: psikologId,
  });

  psikologToken = signToken({
    userId: psikologId,
    sessionId: psySession._id,
  });
});

afterEach(async () => {
  await ConsultationModel.deleteMany({});
  await chatRoom.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Consultation Integration - Mahasiswa", () => {
  // ================= APPLY =================
  describe("Apply Consultation", () => {
    test("TC-INT-CONS-MHS-001 : tanpa token - should 401", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-001",
        method: "POST",
        url: "/api/consultation/apply",
        payload: {},
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);

      const cons = await ConsultationModel.find();
      const rooms = await chatRoom.find();

      expect(cons.length).toBe(0);
      expect(rooms.length).toBe(0);
    });

    test("TC-INT-CONS-MHS-002 : role bukan mahasiswa - should 403", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-002",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${psikologToken}` },
        payload: { psychologistId: psikologId, message: "Halo" },
        expectedStatus: FORBIDDEN,
      });

      expect(res.status).toBe(FORBIDDEN);

      expect(await ConsultationModel.countDocuments()).toBe(0);
    });

    test("TC-INT-CONS-MHS-003 : psychologistId kosong - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-003",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { message: "Halo" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);

      expect(await ConsultationModel.countDocuments()).toBe(0);
    });

    test("TC-INT-CONS-MHS-004 : psychologistId invalid - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-004",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: "123", message: "Halo" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-MHS-005 : psychologist tidak ditemukan - should 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await apiTest({
        id: "TC-INT-CONS-MHS-005",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: fakeId, message: "Halo" },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("TC-INT-CONS-MHS-006 : message kosong - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-006",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: psikologId, message: "" },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-MHS-007 : message terlalu panjang - should 413", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-007",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: psikologId, message: "a".repeat(1001) },
        expectedStatus: TO_LARGE,
      });

      expect(res.status).toBe(TO_LARGE);
    });

    test("TC-INT-CONS-MHS-008 : duplicate pending - should 409", async () => {
      await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await apiTest({
        id: "TC-INT-CONS-MHS-008",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: psikologId, message: "Halo" },
        expectedStatus: CONFLICT,
      });

      expect(res.status).toBe(CONFLICT);
    });

    test("TC-INT-CONS-MHS-009 : apply success - should 201 & create DB", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-009",
        method: "POST",
        url: "/api/consultation/apply",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        payload: { psychologistId: psikologId, message: "Halo" },
        expectedStatus: CREATED,
      });

      expect(res.status).toBe(CREATED);

      const cons = await ConsultationModel.find();
      const rooms = await chatRoom.find();

      expect(cons.length).toBe(1);
      expect(cons[0].status).toBe("pending");

      expect(rooms.length).toBe(1);
      expect(rooms[0].participants.length).toBe(2);
      expect(rooms[0].status).toBe("inactive");
    });
  });

  // ================= HISTORY =================
  describe("Consultation History", () => {
    test("TC-INT-CONS-MHS-010 : tanpa token - should 401", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-010",
        method: "GET",
        url: "/api/user/consultation/history",
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("TC-INT-CONS-MHS-011 : get history success - only own data", async () => {
      await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      await ConsultationModel.create({
        userId: new mongoose.Types.ObjectId(),
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await apiTest({
        id: "TC-INT-CONS-MHS-011",
        method: "GET",
        url: "/api/user/consultation/history",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(res.body.data.length).toBe(1);
    });

    test("TC-INT-CONS-MHS-012 : history kosong - return []", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-012",
        method: "GET",
        url: "/api/user/consultation/history",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(res.body.data.length).toBe(0);
    });
  });

  // ================= DETAIL =================
  describe("Consultation Detail", () => {
    test("TC-INT-CONS-MHS-013 : tanpa token - should 401", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-013",
        method: "GET",
        url: `/api/user/consultation/history/${new mongoose.Types.ObjectId()}`,
        expectedStatus: UNAUTHORIZED,
      });

      expect(res.status).toBe(UNAUTHORIZED);
    });

    test("TC-INT-CONS-MHS-014 : invalid id - should 400", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-014",
        method: "GET",
        url: "/api/user/consultation/history/abc",
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: BAD_REQUEST,
      });

      expect(res.status).toBe(BAD_REQUEST);
    });

    test("TC-INT-CONS-MHS-015 : consultation not found - should 404", async () => {
      const res = await apiTest({
        id: "TC-INT-CONS-MHS-015",
        method: "GET",
        url: `/api/user/consultation/history/${new mongoose.Types.ObjectId()}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: NOT_FOUND,
      });

      expect(res.status).toBe(NOT_FOUND);
    });

    test("TC-INT-CONS-MHS-016 : akses milik user lain - should 403", async () => {
      const otherUser = new mongoose.Types.ObjectId();

      const cons = await ConsultationModel.create({
        userId: otherUser,
        psychologistId: psikologId,
        status: "pending",
      });

      const res = await apiTest({
        id: "TC-INT-CONS-MHS-016",
        method: "GET",
        url: `/api/user/consultation/history/${cons._id}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: FORBIDDEN,
      });

      expect(res.status).toBe(FORBIDDEN);
    });

    test("TC-INT-CONS-MHS-017 : get detail success", async () => {
      const cons = await ConsultationModel.create({
        userId: mahasiswaId,
        psychologistId: psikologId,
        status: "pending",
      });

      const id = cons._id as mongoose.Types.ObjectId;

      const res = await apiTest({
        id: "TC-INT-CONS-MHS-017",
        method: "GET",
        url: `/api/user/consultation/history/${cons._id}`,
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
        expectedStatus: OK,
      });

      expect(res.status).toBe(OK);
      expect(res.body.data._id.toString()).toBe(id.toString());
    });
  });
});

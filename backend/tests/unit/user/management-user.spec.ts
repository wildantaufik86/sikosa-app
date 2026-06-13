import mongoose from "mongoose";
import { ERROR_MSG } from "../../../src/constants/errorMessage";
import { hashValue } from "../../../src/utils/bcrypt";
import { ConsultationModel } from "../../../src/models/consultationModel";
import UserModel from "../../../src/models/userModel";
import {
  createUserRecord,
  deleteUserRecord,
  getAllConsultationRecords,
  getAllUsers,
  getUserProfileById,
  updateUserRecord,
} from "../../../src/services/admin.service";
import { logTestContext } from "../../helpers/unit-test-logger";

// ─── Mock Dependencies ───────────────────────────────────────────────────────

jest.mock("../../../src/models/userModel");
jest.mock("../../../src/models/consultationModel");
jest.mock("../../../src/utils/bcrypt");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeObjectId = () => new mongoose.Types.ObjectId();

const mockUser = (overrides = {}) => ({
  _id: makeObjectId(),
  email: "user@example.com",
  nim: "12345",
  password: "hashed",
  role: "mahasiswa",
  profile: {
    fullname: "Test User",
    picture: "",
    description: "",
    educationBackground: [],
    specialization: "",
  },
  save: jest.fn().mockResolvedValue(undefined),
  toObject: jest.fn().mockReturnThis(),
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// GET USERS
// ─────────────────────────────────────────────────────────────────────────────

describe("getAllUsers", () => {
  afterEach(() => jest.clearAllMocks());

  test("TC-UM-001 : find() berhasil dipanggil dengan data valid - mengembalikan array berisi semua user", async () => {
    logTestContext({
      input: {},
      expected: 'returns array of 2 user objects',
    });
    const users = [mockUser(), mockUser({ email: "b@example.com" })];
    (UserModel.find as jest.Mock).mockReturnValue({ lean: () => Promise.resolve(users) });

    const result = await getAllUsers();

    expect(result).toEqual(users);
    expect(result).toHaveLength(2);
  });

  test("TC-UM-002 : find() berhasil dipanggil namun tidak ada data - mengembalikan array kosong", async () => {
    logTestContext({
      input: {},
      expected: 'returns empty array when no users exist',
    });
    (UserModel.find as jest.Mock).mockReturnValue({ lean: () => Promise.resolve([]) });

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });

  test("TC-UM-023 : find() melempar error database - melempar Internal server error", async () => {
    logTestContext({
      input: {},
      expected: 'throws Internal server error when find() rejects',
    });
    (UserModel.find as jest.Mock).mockReturnValue({
      lean: () => Promise.reject(new Error(ERROR_MSG.INTERNAL_SERVER_ERROR)),
    });

    await expect(getAllUsers()).rejects.toThrow(ERROR_MSG.INTERNAL_SERVER_ERROR);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

describe("getUserProfileById", () => {
  afterEach(() => jest.clearAllMocks());

  test("TC-UM-003 : findById() menemukan user dengan ID valid - mengembalikan object berisi email, nim, dan profile", async () => {
    logTestContext({
      input: { userId: 'valid-object-id' },
      expected: 'returns object with email "a@example.com" and nim "123"',
    });
    const user = { _id: makeObjectId(), email: "a@example.com", nim: "123", profile: {} };
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    const result = await getUserProfileById(user._id.toString());

    expect(result).toMatchObject({ email: "a@example.com", nim: "123" });
  });

  test("TC-UM-004 : findById() tidak menemukan user - mengembalikan null", async () => {
    logTestContext({
      input: { userId: 'non-existent-id' },
      expected: 'returns null',
    });
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(null) }),
    });

    const result = await getUserProfileById(makeObjectId().toString());

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER
// ─────────────────────────────────────────────────────────────────────────────

describe("createUserRecord", () => {
  afterEach(() => jest.clearAllMocks());

  test("TC-UM-005 : save() berhasil dengan data lengkap - mengembalikan object user yang tersimpan", async () => {
    logTestContext({
      input: { email: "new@example.com", password: "pass", role: "mahasiswa", nim: "999", fullname: "New User" },
      expected: 'calls save() and returns defined user object',
    });
    const payload = {
      email: "new@example.com",
      password: "pass",
      role: "mahasiswa",
      nim: "999",
      fullname: "New User",
    };
    const saved = mockUser({ email: payload.email, nim: payload.nim });
    (UserModel as unknown as jest.Mock).mockImplementation(() => saved);

    const result = await createUserRecord(payload);

    expect(saved.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test("TC-UM-006 : nim berisi spasi dikirim sebagai input - nim tersimpan sebagai string kosong", async () => {
    logTestContext({
      input: { email: "x@x.com", password: "p", role: "mahasiswa", nim: "   " },
      expected: 'saved.nim is "" (whitespace-only NIM trimmed to empty string)',
    });
    const saved = mockUser({ nim: "" });
    (UserModel as unknown as jest.Mock).mockImplementation(() => saved);

    await createUserRecord({ email: "x@x.com", password: "p", role: "mahasiswa", nim: "   " });

    expect(saved.nim).toBe("");
  });

  test("TC-UM-007 : fullname dan picture tidak disertakan dalam payload - profile.fullname dan profile.picture default string kosong", async () => {
    logTestContext({
      input: { email: "x@x.com", password: "p", role: "mahasiswa" },
      expected: 'saved.profile.fullname and saved.profile.picture are both ""',
    });
    const saved = mockUser({ profile: { fullname: "", picture: "" } });
    (UserModel as unknown as jest.Mock).mockImplementation(() => saved);

    await createUserRecord({ email: "x@x.com", password: "p", role: "mahasiswa" });

    expect(saved.profile.fullname).toBe("");
    expect(saved.profile.picture).toBe("");
  });

  test("TC-UM-024 : save() melempar error database - melempar Internal server error", async () => {
    logTestContext({
      input: { email: "x@x.com", password: "p", role: "mahasiswa" },
      expected: 'throws Internal server error when save() rejects',
    });
    const failUser = mockUser();
    failUser.save.mockRejectedValue(new Error(ERROR_MSG.INTERNAL_SERVER_ERROR));
    (UserModel as unknown as jest.Mock).mockImplementation(() => failUser);

    await expect(createUserRecord({ email: "x@x.com", password: "p", role: "mahasiswa" })).rejects.toThrow(
      ERROR_MSG.INTERNAL_SERVER_ERROR
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────────────────────────────────────────

describe("updateUserRecord", () => {
  afterEach(() => jest.clearAllMocks());

  test("TC-UM-008 : findById() tidak menemukan user - mengembalikan null", async () => {
    logTestContext({
      input: { userId: 'non-existent-id' },
      expected: 'returns null when user not found',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const result = await updateUserRecord({ userId: makeObjectId().toString() });

    expect(result).toBeNull();
  });

  test("TC-UM-009 : email baru dikirim dan save() berhasil - email user berubah sesuai input", async () => {
    logTestContext({
      input: { userId: 'user-id', email: "new@email.com" },
      expected: 'user.email updated to "new@email.com" and save() called',
    });
    const user = mockUser();
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: () => Promise.resolve({ ...user, email: "new@email.com" }),
      }),
    });

    await updateUserRecord({ userId: user._id.toString(), email: "new@email.com" });

    expect(user.email).toBe("new@email.com");
    expect(user.save).toHaveBeenCalled();
  });

  test("TC-UM-010 : password baru dikirim dan hashValue() dipanggil - password tersimpan dalam bentuk hash", async () => {
    logTestContext({
      input: { userId: 'user-id', password: "newplain" },
      expected: 'hashValue called with "newplain" and user.password set to "hashed_password"',
    });
    const user = mockUser();
    (hashValue as jest.Mock).mockResolvedValue("hashed_password");
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString(), password: "newplain" });

    expect(hashValue).toHaveBeenCalledWith("newplain");
    expect(user.password).toBe("hashed_password");
  });

  test("TC-UM-011 : role baru dikirim dan save() berhasil - role user berubah sesuai input", async () => {
    logTestContext({
      input: { userId: 'user-id', role: "psikolog" },
      expected: 'user.role updated to "psikolog"',
    });
    const user = mockUser();
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString(), role: "psikolog" });

    expect(user.role).toBe("psikolog");
  });

  test("TC-UM-012 : fullname baru dikirim dan save() berhasil - profile.fullname berubah sesuai input", async () => {
    logTestContext({
      input: { userId: 'user-id', fullname: "Nama Baru" },
      expected: 'user.profile.fullname updated to "Nama Baru"',
    });
    const user = mockUser();
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString(), fullname: "Nama Baru" });

    expect(user.profile.fullname).toBe("Nama Baru");
  });

  test("TC-UM-013 : specialization baru dikirim dan save() berhasil - profile.specialization tersimpan sesuai input", async () => {
    logTestContext({
      input: { userId: 'user-id', specialization: "Klinis" },
      expected: 'user.profile.specialization updated to "Klinis"',
    });
    const user = mockUser();
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString(), specialization: "Klinis" });

    expect(user.profile.specialization).toBe("Klinis");
  });

  test("TC-UM-014 : educationBackground array dikirim dan save() berhasil - profile.educationBackground tersimpan sebagai array", async () => {
    logTestContext({
      input: { userId: 'user-id', educationBackground: ["S1 Psikologi", "S2 Klinis"] },
      expected: 'user.profile.educationBackground updated to ["S1 Psikologi", "S2 Klinis"]',
    });
    const user = mockUser();
    const edu = ["S1 Psikologi", "S2 Klinis"];
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString(), educationBackground: edu });

    expect(user.profile.educationBackground).toEqual(edu);
  });

  test("TC-UM-015 : tidak ada field opsional yang dikirim - data user tidak berubah dari nilai awal", async () => {
    logTestContext({
      input: { userId: 'user-id' },
      expected: 'user.email remains unchanged when no optional fields are sent',
    });
    const user = mockUser();
    const originalEmail = user.email;
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({ lean: () => Promise.resolve(user) }),
    });

    await updateUserRecord({ userId: user._id.toString() });

    expect(user.email).toBe(originalEmail);
  });

  test("TC-UM-022 : userId dengan format tidak valid dikirim - melempar Invalid user", async () => {
    logTestContext({
      input: { userId: "invalid-id" },
      expected: 'throws Invalid user error',
    });
    (UserModel.findById as jest.Mock).mockRejectedValue(new Error(ERROR_MSG.INVALID_USER));

    await expect(updateUserRecord({ userId: "invalid-id" })).rejects.toThrow(ERROR_MSG.INVALID_USER);
  });

  test("TC-UM-025 : save() melempar error database saat update - melempar Internal server error", async () => {
    logTestContext({
      input: { userId: 'user-id', email: "fail@example.com" },
      expected: 'throws Internal server error when save() rejects during update',
    });
    const user = mockUser();
    user.save.mockRejectedValue(new Error(ERROR_MSG.INTERNAL_SERVER_ERROR));
    (UserModel.findById as jest.Mock).mockResolvedValueOnce(user);

    await expect(updateUserRecord({ userId: user._id.toString(), email: "fail@example.com" })).rejects.toThrow(
      ERROR_MSG.INTERNAL_SERVER_ERROR
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────────────────────────────────────────

describe("deleteUserRecord", () => {
  afterEach(() => jest.clearAllMocks());

  test("TC-UM-016 : findByIdAndDelete() tidak menemukan user - mengembalikan null", async () => {
    logTestContext({
      input: { userId: 'non-existent-id' },
      expected: 'returns null when user not found',
    });
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const result = await deleteUserRecord(makeObjectId().toString());

    expect(result).toBeNull();
  });

  test("TC-UM-017 : findByIdAndDelete() berhasil menghapus user - mengembalikan object user yang terhapus", async () => {
    logTestContext({
      input: { userId: 'existing-user-id' },
      expected: 'returns deleted user object with email "del@example.com"',
    });
    const user = { _id: makeObjectId(), email: "del@example.com" };
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(user);

    const result = await deleteUserRecord(user._id.toString());

    expect(result).toMatchObject({ email: "del@example.com" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTATION
// ─────────────────────────────────────────────────────────────────────────────

describe("getAllConsultationRecords", () => {
  afterEach(() => jest.clearAllMocks());

  const mockConsultationData = (overrides: Partial<any> = {}) => ({
    _id: makeObjectId(),
    psychologistId: {
      _id: makeObjectId(),
      email: "psiko@example.com",
      profile: { fullname: "Dr. Psiko" },
    },
    userId: {
      _id: makeObjectId(),
      email: "mhs@example.com",
      profile: { fullname: "Mahasiswa A" },
    },
    status: "pending",
    createdAt: new Date(),
    ...overrides,
  });

  /**
   * Chain mock: find() → populate() → populate() → lean()
   * Dua kali populate() dipanggil secara berantai (psychologistId & userId),
   * sehingga mock harus mengembalikan `this` pada setiap pemanggilan populate().
   */
  const mockChain = (data: any[]) => {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(data),
    };
    (ConsultationModel.find as jest.Mock).mockReturnValue(chain);
    return chain;
  };

  test("TC-UM-018 : find().populate().populate().lean() berhasil dengan data lengkap - mengembalikan array consultation yang sudah dipetakan ke format service", async () => {
    logTestContext({
      input: {},
      expected: 'returns array of 1 consultation mapped to service format with consultationId, psychologist, user, status',
    });
    const consultations = [mockConsultationData()];
    mockChain(consultations);

    const result = await getAllConsultationRecords();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      consultationId: expect.any(String),
      psychologist: { email: "psiko@example.com", fullname: "Dr. Psiko" },
      user: { email: "mhs@example.com", fullname: "Mahasiswa A" },
      status: "pending",
    });
  });

  test("TC-UM-019 : find().populate().populate().lean() berhasil namun tidak ada data - mengembalikan array kosong", async () => {
    logTestContext({
      input: {},
      expected: 'returns empty array when no consultations exist',
    });
    mockChain([]);

    const result = await getAllConsultationRecords();

    expect(result).toEqual([]);
  });

  test("TC-UM-020 : profile tidak memiliki field fullname pada userId maupun psychologistId - fullname default menjadi string kosong", async () => {
    logTestContext({
      input: { userId: { profile: {} }, psychologistId: { profile: undefined } },
      expected: 'result[0].user.fullname and result[0].psychologist.fullname both default to ""',
    });
    const consultation = mockConsultationData({
      userId: { _id: makeObjectId(), email: "mhs@example.com", profile: {} },
      psychologistId: { _id: makeObjectId(), email: "psiko@example.com", profile: undefined },
    });
    mockChain([consultation]);

    const result = await getAllConsultationRecords();

    expect(result[0].user.fullname).toBe("");
    expect(result[0].psychologist.fullname).toBe("");
  });

  test("TC-UM-021 : data user dan psikolog lengkap tersedia - hasil mapping memiliki semua field sesuai struktur service", async () => {
    logTestContext({
      input: {},
      expected: 'result item has consultationId, psychologist (_id, fullname, email), user (_id, fullname, email), status, createdAt',
    });
    const consultation = mockConsultationData();
    mockChain([consultation]);

    const result = await getAllConsultationRecords();
    const item = result[0];

    expect(item).toHaveProperty("consultationId");
    expect(item.psychologist).toHaveProperty("_id");
    expect(item.psychologist).toHaveProperty("fullname");
    expect(item.psychologist).toHaveProperty("email");
    expect(item.user).toHaveProperty("_id");
    expect(item.user).toHaveProperty("fullname");
    expect(item.user).toHaveProperty("email");
    expect(item).toHaveProperty("status");
    expect(item).toHaveProperty("createdAt");
  });
});

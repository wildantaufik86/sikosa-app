import AppErrorCode from "../../../src/constants/appErrorCode";
import { BAD_REQUEST, CONFLICT } from "../../../src/constants/http";
import SessionModel from "../../../src/models/sessionModel";
import UserModel from "../../../src/models/userModel";
import VerificationCodeModel from "../../../src/models/verificationCodeModel";
import { createAccount } from "../../../src/services/auth.service";
import { signToken } from "../../../src/utils/jwt";

// mock
jest.mock("../../../src/models/userModel");
jest.mock("../../../src/models/verificationCodeModel");
jest.mock("../../../src/models/sessionModel");
jest.mock("../../../src/utils/jwt");

describe("Auth service - Register", () => {
  const validData = {
    email: "user@gmail.com",
    password: "Password123!",
    nim: "12345678",
    profile: {
      fullname: "Muhammad Aidil",
      picture: "http://img.com/a.jpg",
    },
    role: "mahasiswa",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (UserModel.exists as jest.Mock).mockResolvedValue(false);
    (UserModel.create as jest.Mock).mockResolvedValue({
      _id: "user123",
      omitPassword: jest.fn().mockReturnValue({ email: validData.email }),
    });

    (VerificationCodeModel.create as jest.Mock).mockResolvedValue({});
    (SessionModel.create as jest.Mock).mockResolvedValue({ _id: "session123" });
    (signToken as jest.Mock).mockReturnValue("token");
  });

  test("TC-AUTH-01 Email kosong", async () => {
    await expect(createAccount({ ...validData, email: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Email is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-02 Format email tidak valid", async () => {
    await expect(createAccount({ ...validData, email: "usergmail.com" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid email format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-03 Email valid", async () => {
    const res = await createAccount(validData);
    expect(res).toHaveProperty("accessToken");
  });

  test("TC-AUTH-04 Email sudah terdaftar", async () => {
    (UserModel.exists as jest.Mock).mockResolvedValue(true);

    await expect(createAccount(validData)).rejects.toMatchObject({
      statusCode: CONFLICT,
      message: "Email already exists",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-05 Email dengan spasi", async () => {
    await expect(createAccount({ ...validData, email: "user @gmail.com" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid email format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-06 NIM valid", async () => {
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-07 NIM kosong", async () => {
    const res = await createAccount({ ...validData, nim: undefined });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-08 NIM huruf", async () => {
    await expect(createAccount({ ...validData, nim: "123ABC" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM must be numeric",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-09 NIM pendek", async () => {
    await expect(createAccount({ ...validData, nim: "123" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM length is invalid",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-10 NIM panjang", async () => {
    await expect(createAccount({ ...validData, nim: "12345678901234567890" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM length is invalid",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-11 Password valid", async () => {
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-12 Password kosong", async () => {
    await expect(createAccount({ ...validData, password: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-13 Password pendek", async () => {
    await expect(createAccount({ ...validData, password: "12345" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password too short",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-14 Password lemah", async () => {
    await expect(createAccount({ ...validData, password: "password" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password must contain uppercase, number, and symbol",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-15 Password panjang", async () => {
    await expect(createAccount({ ...validData, password: "A1!".repeat(20) })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password too long",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-16 Fullname valid", async () => {
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-17 Fullname kosong", async () => {
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-18 Fullname pendek", async () => {
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "A" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname too short",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-19 Fullname angka", async () => {
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "Aidil123" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname must contain only letters",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-20 Fullname panjang", async () => {
    await expect(
      createAccount({ ...validData, profile: { ...validData.profile, fullname: "A".repeat(100) } })
    ).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname too long",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-21 Picture valid", async () => {
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-22 Picture kosong", async () => {
    const res = await createAccount({
      ...validData,
      profile: { ...validData.profile, picture: "" },
    });

    expect(res).toBeDefined();

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          picture: null,
        }),
      })
    );
  });

  test("TC-AUTH-23 URL tidak valid", async () => {
    await expect(createAccount({ ...validData, profile: { ...validData.profile, picture: "abc" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid URL format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-24 URL bukan gambar", async () => {
    await expect(
      createAccount({ ...validData, profile: { ...validData.profile, picture: "http://test.com/file.txt" } })
    ).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid image URL",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-25 URL panjang", async () => {
    await expect(
      createAccount({
        ...validData,
        profile: { ...validData.profile, picture: "http://" + "a".repeat(300) + ".jpg" },
      })
    ).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "URL too long",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-26 Role mahasiswa", async () => {
    const res = await createAccount({ ...validData, role: "mahasiswa" });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-27 Role psikolog", async () => {
    const res = await createAccount({ ...validData, role: "psikolog" });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-28 Role admin", async () => {
    const res = await createAccount({ ...validData, role: "admin" });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-29 Role tidak valid", async () => {
    await expect(createAccount({ ...validData, role: "guest" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid role",
      errorCode: AppErrorCode.InvalidRole,
    });
  });

  test("TC-AUTH-30 Role kosong", async () => {
    await expect(createAccount({ ...validData, role: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Role is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });
});

import AppErrorCode from "../../../src/constants/appErrorCode";
import { ERROR_MSG } from "../../../src/constants/errorMessage";
import { BAD_REQUEST, CONFLICT, FORBIDDEN } from "../../../src/constants/http";
import SessionModel from "../../../src/models/sessionModel";
import UserModel from "../../../src/models/userModel";
import VerificationCodeModel from "../../../src/models/verificationCodeModel";
import { createAccount } from "../../../src/services/auth.service";
import { signToken } from "../../../src/utils/jwt";
import { logTestContext } from "../../helpers/unit-test-logger";

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
    logTestContext({
      input: { ...validData, email: "" },
      expected: 'throws BAD_REQUEST with message "Email is required"',
    });
    await expect(createAccount({ ...validData, email: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Email is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-02 Format email tidak valid", async () => {
    logTestContext({
      input: { ...validData, email: "usergmail.com" },
      expected: 'throws BAD_REQUEST with message "Invalid email format"',
    });
    await expect(createAccount({ ...validData, email: "usergmail.com" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid email format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-03 Email valid", async () => {
    logTestContext({
      input: validData,
      expected: 'returns object with accessToken',
    });
    const res = await createAccount(validData);
    expect(res).toHaveProperty("accessToken");
  });

  test("TC-AUTH-04 Email sudah terdaftar", async () => {
    logTestContext({
      input: validData,
      expected: 'throws CONFLICT with message "Email already exists"',
    });
    (UserModel.exists as jest.Mock).mockResolvedValue(true);

    await expect(createAccount(validData)).rejects.toMatchObject({
      statusCode: CONFLICT,
      message: "Email already exists",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-05 Email dengan spasi", async () => {
    logTestContext({
      input: { ...validData, email: "user @gmail.com" },
      expected: 'throws BAD_REQUEST with message "Invalid email format"',
    });
    await expect(createAccount({ ...validData, email: "user @gmail.com" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid email format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-06 NIM valid", async () => {
    logTestContext({
      input: { ...validData, nim: "12345678" },
      expected: 'returns defined result (account created successfully)',
    });
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-07 NIM kosong", async () => {
    logTestContext({
      input: { ...validData, nim: undefined },
      expected: 'returns defined result (NIM is optional)',
    });
    const res = await createAccount({ ...validData, nim: undefined });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-08 NIM huruf", async () => {
    logTestContext({
      input: { ...validData, nim: "123ABC" },
      expected: 'throws BAD_REQUEST with message "NIM must be numeric"',
    });
    await expect(createAccount({ ...validData, nim: "123ABC" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM must be numeric",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-09 NIM pendek", async () => {
    logTestContext({
      input: { ...validData, nim: "123" },
      expected: 'throws BAD_REQUEST with message "NIM length is invalid"',
    });
    await expect(createAccount({ ...validData, nim: "123" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM length is invalid",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-10 NIM panjang", async () => {
    logTestContext({
      input: { ...validData, nim: "12345678901234567890" },
      expected: 'throws BAD_REQUEST with message "NIM length is invalid"',
    });
    await expect(createAccount({ ...validData, nim: "12345678901234567890" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "NIM length is invalid",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-11 Password valid", async () => {
    logTestContext({
      input: { ...validData, password: "Password123!" },
      expected: 'returns defined result (account created successfully)',
    });
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-12 Password kosong", async () => {
    logTestContext({
      input: { ...validData, password: "" },
      expected: 'throws BAD_REQUEST with message "Password is required"',
    });
    await expect(createAccount({ ...validData, password: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-13 Password pendek", async () => {
    logTestContext({
      input: { ...validData, password: "12345" },
      expected: 'throws BAD_REQUEST with message "Password too short"',
    });
    await expect(createAccount({ ...validData, password: "12345" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password too short",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-14 Password lemah", async () => {
    logTestContext({
      input: { ...validData, password: "password" },
      expected: 'throws BAD_REQUEST with message "Password must contain uppercase, number, and symbol"',
    });
    await expect(createAccount({ ...validData, password: "password" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password must contain uppercase, number, and symbol",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-15 Password panjang", async () => {
    logTestContext({
      input: { ...validData, password: "A1!".repeat(20) },
      expected: 'throws BAD_REQUEST with message "Password too long"',
    });
    await expect(createAccount({ ...validData, password: "A1!".repeat(20) })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password too long",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-16 Fullname valid", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, fullname: "Muhammad Aidil" } },
      expected: 'returns defined result (account created successfully)',
    });
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-17 Fullname kosong", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, fullname: "" } },
      expected: 'throws BAD_REQUEST with message "Fullname is required"',
    });
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-18 Fullname pendek", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, fullname: "A" } },
      expected: 'throws BAD_REQUEST with message "Fullname too short"',
    });
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "A" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname too short",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-19 Fullname angka", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, fullname: "Aidil123" } },
      expected: 'throws BAD_REQUEST with message "Fullname must contain only letters"',
    });
    await expect(createAccount({ ...validData, profile: { ...validData.profile, fullname: "Aidil123" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname must contain only letters",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-20 Fullname panjang", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, fullname: "A".repeat(100) } },
      expected: 'throws BAD_REQUEST with message "Fullname too long"',
    });
    await expect(
      createAccount({ ...validData, profile: { ...validData.profile, fullname: "A".repeat(100) } })
    ).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Fullname too long",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-21 Picture valid", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, picture: "http://img.com/a.jpg" } },
      expected: 'returns defined result (account created successfully)',
    });
    const res = await createAccount(validData);
    expect(res).toBeDefined();
  });

  test("TC-AUTH-22 Picture kosong", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, picture: "" } },
      expected: 'returns defined result and UserModel.create called with profile.picture as null',
    });
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
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, picture: "abc" } },
      expected: 'throws BAD_REQUEST with message "Invalid URL format"',
    });
    await expect(createAccount({ ...validData, profile: { ...validData.profile, picture: "abc" } })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid URL format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-24 URL bukan gambar", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, picture: "http://test.com/file.txt" } },
      expected: 'throws BAD_REQUEST with message "Invalid image URL"',
    });
    await expect(
      createAccount({ ...validData, profile: { ...validData.profile, picture: "http://test.com/file.txt" } })
    ).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid image URL",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-AUTH-25 URL panjang", async () => {
    logTestContext({
      input: { ...validData, profile: { ...validData.profile, picture: "http://" + "a".repeat(300) + ".jpg" } },
      expected: 'throws BAD_REQUEST with message "URL too long"',
    });
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
    logTestContext({
      input: { ...validData, role: "mahasiswa" },
      expected: 'returns defined result (mahasiswa role allowed)',
    });
    const res = await createAccount({ ...validData, role: "mahasiswa" });
    expect(res).toBeDefined();
  });

  test("TC-AUTH-27 Role psikolog", async () => {
    logTestContext({
      input: { ...validData, role: "psikolog" },
      expected: 'throws FORBIDDEN with REGISTER_ROLE_FORBIDDEN message',
    });
    await expect(createAccount({ ...validData, role: "psikolog" })).rejects.toMatchObject({
      statusCode: FORBIDDEN,
      message: ERROR_MSG.REGISTER_ROLE_FORBIDDEN,
    });
  });

  test("TC-AUTH-28 Role admin", async () => {
    logTestContext({
      input: { ...validData, role: "admin" },
      expected: 'throws FORBIDDEN with REGISTER_ROLE_FORBIDDEN message',
    });
    await expect(createAccount({ ...validData, role: "admin" })).rejects.toMatchObject({
      statusCode: FORBIDDEN,
      message: ERROR_MSG.REGISTER_ROLE_FORBIDDEN,
    });
  });

  test("TC-AUTH-29 Role tidak valid", async () => {
    logTestContext({
      input: { ...validData, role: "guest" },
      expected: 'throws BAD_REQUEST with message "Invalid role"',
    });
    await expect(createAccount({ ...validData, role: "guest" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid role",
      errorCode: AppErrorCode.InvalidRole,
    });
  });

  test("TC-AUTH-30 Role kosong", async () => {
    logTestContext({
      input: { ...validData, role: "" },
      expected: 'throws BAD_REQUEST with message "Role is required"',
    });
    await expect(createAccount({ ...validData, role: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Role is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });
});

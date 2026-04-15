import AppErrorCode from "../../../src/constants/appErrorCode";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from "../../../src/constants/http";
import SessionModel from "../../../src/models/sessionModel";
import UserModel from "../../../src/models/userModel";
import { loginUser } from "../../../src/services/auth.service";

// mock
jest.mock("../../../src/models/userModel");
jest.mock("../../../src/models/verificationCodeModel");
jest.mock("../../../src/models/sessionModel");
jest.mock("../../../src/utils/jwt");

describe("LOGIN - loginUser", () => {
  const basePayload = {
    email: "user@gmail.com",
    password: "password123",
    userAgent: "jest-test",
  };

  const mockUser = {
    _id: "user123",
    email: "user@gmail.com",
    verified: true,
    comparePassword: jest.fn(),
    omitPassword: jest.fn().mockReturnValue({
      _id: "user123",
      email: "user@gmail.com",
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================
  // NEGATIVE CASES
  // ======================

  test("TC-LOGIN-01 : Email kosong → should return 400 BAD_REQUEST", async () => {
    await expect(loginUser({ ...basePayload, email: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Email is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-LOGIN-02 : Password kosong → should return 400 BAD_REQUEST", async () => {
    await expect(loginUser({ ...basePayload, password: "" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Password is required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-LOGIN-03 : Format email tidak valid → should return 400 BAD_REQUEST", async () => {
    await expect(loginUser({ ...basePayload, email: "usergmail.com" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Invalid email format",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-LOGIN-04 : Email tidak terdaftar → should return 404 NOT_FOUND", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(loginUser(basePayload)).rejects.toMatchObject({
      statusCode: NOT_FOUND,
      message: "User not found",
      errorCode: AppErrorCode.UserNotFound,
    });
  });

  test("TC-LOGIN-05 : Password salah → should return 401 UNAUTHORIZED", async () => {
    mockUser.comparePassword.mockResolvedValue(false);
    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    await expect(loginUser(basePayload)).rejects.toMatchObject({
      statusCode: UNAUTHORIZED,
      message: "Invalid Email or Password",
      errorCode: AppErrorCode.InvalidUser,
    });
  });

  test("TC-LOGIN-09 : Email & Password kosong → should return 400 BAD_REQUEST", async () => {
    await expect(loginUser({ email: "", password: "", userAgent: "test" })).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Email and password are required",
      errorCode: AppErrorCode.InvalidPayload,
    });
  });

  test("TC-LOGIN-10 : User belum verifikasi → should return 403 FORBIDDEN", async () => {
    const unverifiedUser = { ...mockUser, verified: false };
    (UserModel.findOne as jest.Mock).mockResolvedValue(unverifiedUser);

    await expect(loginUser(basePayload)).rejects.toMatchObject({
      statusCode: FORBIDDEN,
      message: "Account not verified",
      errorCode: AppErrorCode.InvalidUser,
    });
  });

  // ======================
  // POSITIVE CASES
  // ======================

  test("TC-LOGIN-06 : Login valid → should return 200 OK with token", async () => {
    mockUser.comparePassword.mockResolvedValue(true);

    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    (SessionModel.create as jest.Mock).mockResolvedValue({
      _id: "session123",
    });

    const result = await loginUser(basePayload);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("user");

    expect(result.user).toEqual({
      _id: "user123",
      email: "user@gmail.com",
    });
  });

  test("TC-LOGIN-07 : Email uppercase → should login success (case-insensitive)", async () => {
    mockUser.comparePassword.mockResolvedValue(true);

    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    (SessionModel.create as jest.Mock).mockResolvedValue({
      _id: "session123",
    });

    const result = await loginUser({
      ...basePayload,
      email: "USER@GMAIL.COM",
    });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  test("TC-LOGIN-08 : Email dengan spasi → should handle trim or reject", async () => {
    mockUser.comparePassword.mockResolvedValue(true);

    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    (SessionModel.create as jest.Mock).mockResolvedValue({
      _id: "session123",
    });

    const result = await loginUser({
      ...basePayload,
      email: " user@gmail.com ",
    });

    expect(result).toHaveProperty("accessToken");
  });
});

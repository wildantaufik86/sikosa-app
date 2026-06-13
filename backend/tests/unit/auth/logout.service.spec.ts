import { ERROR_MSG } from "../../../src/constants/errorMessage";
import SessionModel from "../../../src/models/sessionModel";
import { logoutService } from "../../../src/services/auth.service";
import { verifyToken } from "../../../src/utils/jwt";
import { logTestContext } from "../../helpers/unit-test-logger";

jest.mock("../../../src/models/sessionModel");
jest.mock("../../../src/utils/jwt");

describe("Auth service - Logout", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Logout tanpa token : throw 401 Unauthorized", async () => {
    logTestContext({
      input: { accessToken: undefined },
      expected: 'throws Unauthorized error',
    });
    await expect(logoutService({ accessToken: undefined })).rejects.toThrow("Unauthorized");
  });

  test("Token tidak valid : throw 401 Invalid token", async () => {
    logTestContext({
      input: { accessToken: "random-token" },
      expected: 'throws INVALID_TOKEN error',
    });
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("invalid");
    });

    await expect(logoutService({ accessToken: "random-token" })).rejects.toThrow(ERROR_MSG.INVALID_TOKEN);
  });

  test("Token expired : throw 401 Token expired", async () => {
    logTestContext({
      input: { accessToken: "expired-token" },
      expected: 'throws TOKEN_EXPIRED error',
    });
    (verifyToken as jest.Mock).mockImplementation(() => {
      const err: any = new Error("expired");
      err.name = "TokenExpiredError";
      throw err;
    });

    await expect(logoutService({ accessToken: "expired-token" })).rejects.toThrow(ERROR_MSG.TOKEN_EXPIRED);
  });

  test("Logout valid : return 200 dan session terhapus", async () => {
    logTestContext({
      input: { accessToken: "valid-token" },
      expected: 'returns statusCode 200 with message "Logout successful" and calls findByIdAndDelete',
    });
    (verifyToken as jest.Mock).mockReturnValue({
      payload: { sessionId: "session-id" },
    });

    (SessionModel.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "session-id",
    });

    const result = await logoutService({ accessToken: "valid-token" });

    expect(result).toMatchObject({
      statusCode: 200,
      message: "Logout successful",
    });

    expect(SessionModel.findByIdAndDelete).toHaveBeenCalledWith("session-id");
  });

  test("Logout berulang (token sudah invalid) : throw 401 Invalid token", async () => {
    logTestContext({
      input: { accessToken: "used-token" },
      expected: 'throws INVALID_TOKEN error when session no longer exists',
    });
    (verifyToken as jest.Mock).mockReturnValue({
      payload: { sessionId: "session-id" },
    });

    (SessionModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(logoutService({ accessToken: "used-token" })).rejects.toThrow(ERROR_MSG.INVALID_TOKEN);
  });
});

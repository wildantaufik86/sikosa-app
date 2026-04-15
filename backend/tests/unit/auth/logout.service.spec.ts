import SessionModel from "../../../src/models/sessionModel";
import { logoutService } from "../../../src/services/auth.service";
import { verifyToken } from "../../../src/utils/jwt";

jest.mock("../../../src/models/sessionModel");
jest.mock("../../../src/utils/jwt");

describe("Logout Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Logout tanpa token : throw 401 Unauthorized", async () => {
    await expect(logoutService({ accessToken: undefined })).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  test("Token tidak valid : throw 401 Invalid token", async () => {
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("invalid");
    });

    await expect(logoutService({ accessToken: "random-token" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid token",
    });
  });

  test("Token expired : throw 401 Token expired", async () => {
    (verifyToken as jest.Mock).mockImplementation(() => {
      const err: any = new Error("expired");
      err.name = "TokenExpiredError";
      throw err;
    });

    await expect(logoutService({ accessToken: "expired-token" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Token expired",
    });
  });

  test("Logout valid : return 200 dan session terhapus", async () => {
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
    (verifyToken as jest.Mock).mockReturnValue({
      payload: { sessionId: "session-id" },
    });

    (SessionModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(logoutService({ accessToken: "used-token" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid token",
    });
  });
});

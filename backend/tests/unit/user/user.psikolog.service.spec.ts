import mongoose from "mongoose";
import { updateUserProfile } from "../../../src/services/user.service";
import UserModel from "../../../src/models/userModel";
import { ERROR_MSG } from "../../../src/constants/errorMessage";

jest.mock("../../../src/models/userModel");

describe("User service - updateUserProfile - psikolog", () => {
  const userId = new mongoose.Types.ObjectId();

  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: userId,
      nim: "123",
      profile: {
        fullname: "Old Name",
        picture: "old.jpg",
      },
      save: jest.fn().mockResolvedValue(true),
    };
  });

  // ================= NEGATIVE =================

  test("TC-PSI-UP-01 : userId undefined - throw BAD_REQUEST with Invalid user", async () => {
    await expect(updateUserProfile({ userId: undefined })).rejects.toThrow("Invalid user");
  });

  test("TC-PSI-UP-02 : user not found - throw BAD_REQUEST with User not found", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(updateUserProfile({ userId })).rejects.toThrow("User not found");
  });

  test("TC-PSI-UP-14 : database failure - throw propagated error", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      ...mockUser,
      save: jest.fn().mockRejectedValue(new Error(ERROR_MSG.INTERNAL_SERVER_ERROR)),
    });

    await expect(updateUserProfile({ userId, fullname: "Aidil" })).rejects.toThrow(ERROR_MSG.INTERNAL_SERVER_ERROR);
  });

  // ================= POSITIVE =================

  test("TC-PSI-UP-03 : valid fullname - update fullname successfully", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil",
    });

    expect(result.profile.fullname).toBe("Aidil");
  });

  test("TC-PSI-UP-04 : valid nim - update nim successfully", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "456",
    });

    expect(result.nim).toBe("456");
  });

  test("TC-PSI-UP-05 : valid picture - update picture successfully", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "new.jpg",
    });

    expect(result.profile.picture).toBe("new.jpg");
  });

  test("TC-PSI-UP-06 : multiple valid fields - update all fields successfully", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "999",
      fullname: "Aidil",
      picture: "pic.jpg",
    });

    expect(result).toEqual({
      nim: "999",
      profile: {
        fullname: "Aidil",
        picture: "pic.jpg",
      },
    });
  });

  // ================= EDGE =================

  test("TC-PSI-UP-07 : no fields provided - return unchanged profile", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({ userId });

    expect(result).toEqual({
      nim: mockUser.nim,
      profile: mockUser.profile,
    });
  });

  test("TC-PSI-UP-08 : empty fullname - ignore update and keep previous value", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "",
    });

    expect(result.profile.fullname).toBe("Old Name");
  });

  test("TC-PSI-UP-09 : empty nim - ignore update and keep previous value", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "",
    });

    expect(result.nim).toBe("123");
  });

  test("TC-PSI-UP-10 : empty picture - ignore update and keep previous value", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "",
    });

    expect(result.profile.picture).toBe("old.jpg");
  });

  test("TC-PSI-UP-11 : whitespace fullname - store value without trimming", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: " Aidil ",
    });

    expect(result.profile.fullname).toBe(" Aidil ");
  });

  test("TC-PSI-UP-12 : emoji fullname - store value successfully", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil 😎",
    });

    expect(result.profile.fullname).toBe("Aidil 😎");
  });

  test("TC-PSI-UP-13 : invalid data type - assign value without validation", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      // @ts-ignore
      fullname: 123,
    });

    expect(result.profile.fullname).toBe(123);
  });

  test("TC-PSI-UP-15 : concurrent requests - multiple saves executed", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    await Promise.all([updateUserProfile({ userId, fullname: "A" }), updateUserProfile({ userId, fullname: "B" })]);

    expect(mockUser.save).toHaveBeenCalledTimes(2);
  });
});

import mongoose from "mongoose";
import UserModel from "../../../src/models/userModel";
import { updateUserProfile } from "../../../src/services/user.service";
import { logTestContext } from "../../helpers/unit-test-logger";

jest.mock("../../../src/models/userModel");

describe("User service - updateUserProfile - mahasiswa", () => {
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

  test("TC-MHS-UP-01 : userId tidak diberikan - should throw Invalid user", async () => {
    logTestContext({
      input: { userId: undefined },
      expected: 'throws "Invalid user" error',
    });
    await expect(updateUserProfile({ userId: undefined })).rejects.toThrow("Invalid user");
  });

  test("TC-MHS-UP-02 : user tidak ditemukan - should throw User not found", async () => {
    logTestContext({
      input: { userId },
      expected: 'throws "User not found" error',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(updateUserProfile({ userId })).rejects.toThrow("User not found");
  });

  test("TC-MHS-UP-14 : database error saat save - should throw error", async () => {
    logTestContext({
      input: { userId, fullname: "Aidil" },
      expected: 'throws "DB Error" when save() rejects',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue({
      ...mockUser,
      save: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(updateUserProfile({ userId, fullname: "Aidil" })).rejects.toThrow("DB Error");
  });

  // ================= POSITIVE =================

  test("TC-MHS-UP-03 : update fullname valid - fullname terupdate", async () => {
    logTestContext({
      input: { userId, fullname: "Aidil" },
      expected: 'returns user with profile.fullname "Aidil" and calls save()',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil",
    });

    expect(result.profile.fullname).toBe("Aidil");
    expect(mockUser.save).toHaveBeenCalled();
  });

  test("TC-MHS-UP-04 : update nim valid - nim terupdate", async () => {
    logTestContext({
      input: { userId, nim: "456" },
      expected: 'returns user with nim "456"',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "456",
    });

    expect(result.nim).toBe("456");
  });

  test("TC-MHS-UP-05 : update picture valid - picture terupdate", async () => {
    logTestContext({
      input: { userId, picture: "new.jpg" },
      expected: 'returns user with profile.picture "new.jpg"',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "new.jpg",
    });

    expect(result.profile.picture).toBe("new.jpg");
  });

  test("TC-MHS-UP-06 : update multiple field - semua field terupdate", async () => {
    logTestContext({
      input: { userId, nim: "999", fullname: "Aidil", picture: "pic.jpg" },
      expected: 'returns user object with all three fields updated',
    });
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

  test("TC-MHS-UP-07 : tidak ada field diupdate - data tetap", async () => {
    logTestContext({
      input: { userId },
      expected: 'returns user with unchanged nim and profile values',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({ userId });

    expect(result).toEqual({
      nim: mockUser.nim,
      profile: mockUser.profile,
    });
  });

  test("TC-MHS-UP-08 : fullname kosong - tidak mengubah fullname", async () => {
    logTestContext({
      input: { userId, fullname: "" },
      expected: 'returns user with profile.fullname still "Old Name" (empty string ignored)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "",
    });

    expect(result.profile.fullname).toBe("Old Name");
  });

  test("TC-MHS-UP-09 : nim kosong - tidak mengubah nim", async () => {
    logTestContext({
      input: { userId, nim: "" },
      expected: 'returns user with nim still "123" (empty string ignored)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "",
    });

    expect(result.nim).toBe("123");
  });

  test("TC-MHS-UP-10 : picture kosong - tidak mengubah picture", async () => {
    logTestContext({
      input: { userId, picture: "" },
      expected: 'returns user with profile.picture still "old.jpg" (empty string ignored)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "",
    });

    expect(result.profile.picture).toBe("old.jpg");
  });

  test("TC-MHS-UP-11 : fullname whitespace - disimpan apa adanya", async () => {
    logTestContext({
      input: { userId, fullname: " Aidil " },
      expected: 'returns user with profile.fullname " Aidil " (stored as-is without trimming)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: " Aidil ",
    });

    expect(result.profile.fullname).toBe(" Aidil ");
  });

  test("TC-MHS-UP-12 : fullname emoji - tersimpan normal", async () => {
    logTestContext({
      input: { userId, fullname: "Aidil 😎" },
      expected: 'returns user with profile.fullname "Aidil 😎" (emoji stored normally)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil 😎",
    });

    expect(result.profile.fullname).toBe("Aidil 😎");
  });

  test("TC-MHS-UP-13 : tipe data tidak sesuai - tetap diassign", async () => {
    logTestContext({
      input: { userId, fullname: 123 },
      expected: 'returns user with profile.fullname assigned as 123 (no type validation)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      // @ts-ignore
      fullname: 123,
    });

    expect(result.profile.fullname).toBe(123);
  });

  test("TC-MHS-UP-15 : concurrent update - save terpanggil multiple kali", async () => {
    logTestContext({
      input: [{ userId, fullname: "A" }, { userId, fullname: "B" }],
      expected: 'calls save() exactly 2 times (once per concurrent update)',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    await Promise.all([updateUserProfile({ userId, fullname: "A" }), updateUserProfile({ userId, fullname: "B" })]);

    expect(mockUser.save).toHaveBeenCalledTimes(2);
  });
});

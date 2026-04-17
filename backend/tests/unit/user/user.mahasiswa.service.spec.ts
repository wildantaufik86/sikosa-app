import mongoose from "mongoose";
import UserModel from "../../../src/models/userModel";
import { updateUserProfile } from "../../../src/services/user.service";

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
    await expect(updateUserProfile({ userId: undefined })).rejects.toThrow("Invalid user");
  });

  test("TC-MHS-UP-02 : user tidak ditemukan - should throw User not found", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(updateUserProfile({ userId })).rejects.toThrow("User not found");
  });

  test("TC-MHS-UP-14 : database error saat save - should throw error", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      ...mockUser,
      save: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(updateUserProfile({ userId, fullname: "Aidil" })).rejects.toThrow("DB Error");
  });

  // ================= POSITIVE =================

  test("TC-MHS-UP-03 : update fullname valid - fullname terupdate", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil",
    });

    expect(result.profile.fullname).toBe("Aidil");
    expect(mockUser.save).toHaveBeenCalled();
  });

  test("TC-MHS-UP-04 : update nim valid - nim terupdate", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "456",
    });

    expect(result.nim).toBe("456");
  });

  test("TC-MHS-UP-05 : update picture valid - picture terupdate", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "new.jpg",
    });

    expect(result.profile.picture).toBe("new.jpg");
  });

  test("TC-MHS-UP-06 : update multiple field - semua field terupdate", async () => {
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
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({ userId });

    expect(result).toEqual({
      nim: mockUser.nim,
      profile: mockUser.profile,
    });
  });

  test("TC-MHS-UP-08 : fullname kosong - tidak mengubah fullname", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "",
    });

    expect(result.profile.fullname).toBe("Old Name");
  });

  test("TC-MHS-UP-09 : nim kosong - tidak mengubah nim", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      nim: "",
    });

    expect(result.nim).toBe("123");
  });

  test("TC-MHS-UP-10 : picture kosong - tidak mengubah picture", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      picture: "",
    });

    expect(result.profile.picture).toBe("old.jpg");
  });

  test("TC-MHS-UP-11 : fullname whitespace - disimpan apa adanya", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: " Aidil ",
    });

    expect(result.profile.fullname).toBe(" Aidil ");
  });

  test("TC-MHS-UP-12 : fullname emoji - tersimpan normal", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      fullname: "Aidil 😎",
    });

    expect(result.profile.fullname).toBe("Aidil 😎");
  });

  test("TC-MHS-UP-13 : tipe data tidak sesuai - tetap diassign", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await updateUserProfile({
      userId,
      // @ts-ignore
      fullname: 123,
    });

    expect(result.profile.fullname).toBe(123);
  });

  test("TC-MHS-UP-15 : concurrent update - save terpanggil multiple kali", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    await Promise.all([updateUserProfile({ userId, fullname: "A" }), updateUserProfile({ userId, fullname: "B" })]);

    expect(mockUser.save).toHaveBeenCalledTimes(2);
  });
});

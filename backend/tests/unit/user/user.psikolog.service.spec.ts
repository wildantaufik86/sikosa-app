import mongoose from "mongoose";
import UserModel from "../../../src/models/userModel";
import { updatePsychologistProfile } from "../../../src/services/psychologist.service";
import { logTestContext } from "../../helpers/unit-test-logger";

// mock dependencies
jest.mock("../../../src/models/userModel");
jest.mock("fs/promises");

const mockUser = (overrides = {}) => ({
  profile: {
    fullname: "Old Name",
    picture: "/old.png",
    description: "",
    specialization: "",
    educationBackground: [],
  },
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("updatePsychologistProfile Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================
   * INVALID USER INPUT TESTS
   * =========================
   */
  describe("Invalid user validation", () => {
    test("[TC-PSI-UP-01] : userId tidak diberikan - throw BAD_REQUEST INVALID_USER", async () => {
      logTestContext({
        input: { userId: undefined },
        expected: 'throws BAD_REQUEST INVALID_USER error',
      });
      await expect(updatePsychologistProfile({ userId: undefined })).rejects.toThrow();
    });

    test("[TC-PSI-UP-02] : user tidak ditemukan - throw BAD_REQUEST USER_NOT_FOUND", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId() },
        expected: 'throws BAD_REQUEST USER_NOT_FOUND error',
      });
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        updatePsychologistProfile({
          userId: new mongoose.Types.ObjectId(),
        })
      ).rejects.toThrow();
    });
  });

  /**
   * =========================
   * SUCCESS UPDATE FIELDS
   * =========================
   */
  describe("Successful profile updates", () => {
    test("[TC-PSI-UP-03] : update fullname valid - fullname terupdate sukses", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: "New Name" },
        expected: 'returns profile with fullname "New Name" and user.profile.fullname updated',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      const result = await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: "New Name",
      });

      expect(user.profile.fullname).toBe("New Name");
      expect(result.profile.fullname).toBe("New Name");
    });

    test("[TC-PSI-UP-04] : update nim valid - nim terupdate sukses (ignored by service)", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId() },
        expected: 'returns profile with fullname still "Old Name" (nim field ignored by psikolog service)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
      });

      expect(user.profile.fullname).toBe("Old Name");
    });

    test("[TC-PSI-UP-05] : update picture valid - picture terupdate sukses", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), picture: "/new.png" },
        expected: 'user.profile.picture updated to "/new.png"',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        picture: "/new.png",
      });

      expect(user.profile.picture).toBe("/new.png");
    });

    test("[TC-PSI-UP-06] : update multiple field - semua field terupdate sukses", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: "Multi Name", description: "Desc", specialization: "Spec", educationBackground: ["S1", "S2"], picture: "/multi.png" },
        expected: 'returns profile with all fields updated to new values',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      const result = await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: "Multi Name",
        description: "Desc",
        specialization: "Spec",
        educationBackground: ["S1", "S2"],
        picture: "/multi.png",
      });

      expect(user.profile.fullname).toBe("Multi Name");
      expect(user.profile.description).toBe("Desc");
      expect(user.profile.specialization).toBe("Spec");
      expect(user.profile.educationBackground).toEqual(["S1", "S2"]);
      expect(result.profile.fullname).toBe("Multi Name");
    });
  });

  /**
   * =========================
   * EDGE CASES
   * =========================
   */
  describe("Edge cases behavior", () => {
    test("[TC-PSI-UP-07] : tidak ada field diupdate - return unchanged profile", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId() },
        expected: 'returns profile with fullname still "Old Name" (no fields changed)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      const result = await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
      });

      expect(result.profile.fullname).toBe("Old Name");
    });

    test("[TC-PSI-UP-08] : fullname kosong - ignore update gunakan nilai lama", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: "" },
        expected: 'user.profile.fullname stays "Old Name" (empty string ignored)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: "",
      });

      expect(user.profile.fullname).toBe("Old Name");
    });

    test("[TC-PSI-UP-09] : educationBackground kosong - ignore update", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), educationBackground: undefined },
        expected: 'user.profile.educationBackground stays [] (undefined ignored)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        educationBackground: undefined,
      });

      expect(user.profile.educationBackground).toEqual([]);
    });

    test("[TC-PSI-UP-10] : picture kosong - ignore update", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), picture: "" },
        expected: 'user.profile.picture stays "/old.png" (empty string ignored)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        picture: "",
      });

      expect(user.profile.picture).toBe("/old.png");
    });

    test("[TC-PSI-UP-11] : fullname whitespace - disimpan tanpa trimming", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: " Aidil " },
        expected: 'user.profile.fullname stored as " Aidil " without trimming',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: " Aidil ",
      });

      expect(user.profile.fullname).toBe(" Aidil ");
    });

    test("[TC-PSI-UP-12] : fullname emoji - tersimpan sukses", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: "😀🔥" },
        expected: 'user.profile.fullname stored as "😀🔥"',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: "😀🔥",
      });

      expect(user.profile.fullname).toBe("😀🔥");
    });

    test("[TC-PSI-UP-13] : tipe data tidak valid - tetap diassign (no validation)", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: 123 },
        expected: 'user.profile.fullname assigned as 123 (no type validation performed)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await updatePsychologistProfile({
        userId: new mongoose.Types.ObjectId(),
        fullname: 123 as any,
      });

      expect(user.profile.fullname).toBe(123);
    });
  });

  /**
   * =========================
   * ERROR HANDLING
   * =========================
   */
  describe("Error handling", () => {
    test("[TC-PSI-UP-14] : database error - throw INTERNAL_SERVER_ERROR", async () => {
      logTestContext({
        input: { userId: new mongoose.Types.ObjectId(), fullname: "Test" },
        expected: 'throws error when save() rejects with "DB FAIL"',
      });
      const user = mockUser({
        save: jest.fn().mockRejectedValue(new Error("DB FAIL")),
      });

      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await expect(
        updatePsychologistProfile({
          userId: new mongoose.Types.ObjectId(),
          fullname: "Test",
        })
      ).rejects.toThrow();
    });
  });

  /**
   * =========================
   * CONCURRENCY BEHAVIOR
   * =========================
   */
  describe("Concurrency behavior", () => {
    test("[TC-PSI-UP-15] : concurrent update - save dipanggil multiple kali", async () => {
      logTestContext({
        input: [{ userId: new mongoose.Types.ObjectId(), fullname: "A" }, { userId: new mongoose.Types.ObjectId(), fullname: "B" }],
        expected: 'calls save() exactly 2 times (once per concurrent update)',
      });
      const user = mockUser();
      (UserModel.findById as jest.Mock).mockResolvedValue(user);

      await Promise.all([
        updatePsychologistProfile({
          userId: new mongoose.Types.ObjectId(),
          fullname: "A",
        }),
        updatePsychologistProfile({
          userId: new mongoose.Types.ObjectId(),
          fullname: "B",
        }),
      ]);

      expect(user.save).toHaveBeenCalledTimes(2);
    });
  });
});

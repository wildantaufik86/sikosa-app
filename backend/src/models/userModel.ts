import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
  email: string;
  nim: string;
  profile: {
    picture: string;
    fullname: string;
  };
  role: "mahasiswa" | "dokter" | "admin";
  password: string;
  verified: boolean;
  createAt: Date;
  updateAt: Date;
  __v?: any;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "email"
    | "nim"
    | "profile"
    | "verified"
    | "role"
    | "createAt"
    | "updateAt"
    | "__v"
  >;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    nim: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    role: {
      type: String,
      enum: ["mahasiswa", "dokter", "admin"],
      default: "mahasiswa",
    },
    profile: {
      picture: { type: String, default: "" },
      fullname: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;

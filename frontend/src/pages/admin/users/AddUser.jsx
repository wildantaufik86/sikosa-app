import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { createUser } from "../../../utils/api";
import { toast } from "react-toastify";

const AddUser = () => {
  const [email, setEmail] = useState("");
  const [nim, setNim] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");

  const handleSubmit = (e) => {
    e.preventDefault();
    const create = async () => {
      try {
        const data = {
          email: email.trim(),
          nim,
          role,
          fullname: fullname.trim(),
          password: password.trim(),
          confirmPassword: confirmPassword.trim(),
        };

        const response = await createUser(data);
        if (response.error) {
          throw new Error(response.message);
        }
        toast.success(response.message);
        handleResetInput();
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (!email || !password) {
      toast.error("Gagal membuat user");
      toast.error("email or password must be required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Gagal membuat user");
      toast.error("password must be at least 6 character");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Gagal membuat user");
      toast.error("password and confirm password does not match");
      return false;
    }

    create();
  };

  const handleResetInput = () => {
    setEmail("");
    setNim("");
    setFullname("");
    setPassword("");
    setConfirmPassword("");
    setRole("mahasiswa");
  };

  return (
    <div className="pt-16 lg:pt-5 flex flex-col">
      {/* Title with Bottom Border */}
      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">User</h1>

      <Link to="/admin/user">
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </Link>

      <div className="flex-1 mt-4 bg-white shadow-md rounded-md py-2 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="font-semibold text-sm">
              Role
            </label>
            <select
              name="role"
              id="role"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              defaultValue={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mahasiswa">mahasiswa</option>
              <option value="psikolog">psikolog</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="fullname" className="font-semibold text-sm">
              Fullname
            </label>
            <input
              type="text"
              id="fullname"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              autoComplete="off"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
          {role === "mahasiswa" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="nim" className="font-semibold text-sm">
                Nim
              </label>
              <input
                type="text"
                id="nim"
                className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
                autoComplete="off"
                required
                value={nim}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (/^\d*$/.test(inputValue)) {
                    setNim(inputValue);
                  }
                }}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-semibold text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              autoComplete="off"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="font-semibold bg-green-500 py-2 px-4 rounded-md text-white text-sm"
            >
              Save
            </button>
            <Link
              to="/admin/user"
              className="font-semibold bg-red-500 py-2 px-4 rounded-md text-white text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;

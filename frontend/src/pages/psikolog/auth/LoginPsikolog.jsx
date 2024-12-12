import React, { useEffect, useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/hooks";

const LoginPsikolog = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const { authUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }

    // cek jika bukan dokter
    if (authUser?.role !== "dokter") {
      navigate("/");
    }

    navigate("/psikolog/dashboard");
  }, [authUser]);

  if (!authUser) {
    return null;
  }

  if (authUser?.role !== "dokter") {
    return null;
  }

  if (authUser.role === "dokter") {
    return null;
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <div className=" top-0 left-0 p-6  flex items-center">
        <img
          src="/assets/nav-logo.png"
          alt="Website Logo"
          className="w-8 h-8 mr-2"
        />
        <h1 className="text-xl font-bold text-[#35A7FF]">Sikosa</h1>
      </div>

      <div className="flex bg-white py-10 lg:py-0 lg:px-20 font-jakarta lg:min-h-screen">
        {/* Left Side - Image */}
        <div className="w-full lg:w-3/5 hidden lg:flex justify-center">
          <img
            src="/assets/login.png" // Replace with your actual image URL
            alt="Login Background"
            className="w-80 object-cover rounded-lg"
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center w-full lg:w-2/5  bg-white p-6">
          <h2 className="text-3xl font-bold mb-4 text-[#35A7FF]">Sign In</h2>
          <p className="text-sm text-gray-600 font-medium mb-2 max-w-64">
            Log in to access psychologist features and the latest client
            updates.
          </p>

          {/* NIM Input */}
          <div className="w-full mb-4">
            <label
              className="block text-sm text-gray-600 mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaUser className="text-gray-500 mr-3" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="w-full p-2 bg-transparent outline-none"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <label
              className="block text-sm text-gray-600 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaLock className="text-gray-500 mr-3" />
              <input
                id="password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-2 bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="ml-2"
              >
                {passwordVisible ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="w-full flex justify-between items-center mb-4">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2" /> Remember Me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
            Sign In
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPsikolog;

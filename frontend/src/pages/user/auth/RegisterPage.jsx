import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../../../components/user/components/Navbar";

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for Confirm Password visibility
  const [nim, setNim] = useState("");
  const [name, setName] = useState(""); // State for Name
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for Confirm Password

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible); // Toggle Confirm Password visibility
  };

  return (
    <>
      <Navbar />

      <div className="flex bg-white py-10 lg:py-0 lg:px-20 font-jakarta lg:min-h-screen">
        {/* Left Side - Image */}
        <div className="w-full lg:w-3/5 hidden lg:flex justify-center">
          <img
            src="/assets/login.png" // Replace with your actual image URL
            alt="Login Background"
            className="w-96 object-cover rounded-lg"
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center w-full lg:w-2/5 bg-white p-6">
          <h2 className="text-3xl font-bold mb-4 text-[#35A7FF]">Sign Up</h2>
          <p className="text-sm text-gray-600 font-medium">If you already have an account</p>
          <p className="text-sm text-gray-600 font-medium mb-6">
            You can{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign In here!
            </Link>
          </p>

          {/* NIM Input */}
          <div className="w-full mb-4">
            <label className="block text-sm text-gray-600" htmlFor="nim">
              Nim
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaUser className="text-gray-500 mr-3" />
              <input id="nim" type="text" placeholder="Enter your NIM" className="w-full p-2 bg-transparent outline-none" value={nim} onChange={(e) => setNim(e.target.value)} />
            </div>
          </div>

          {/* Name Input */}
          <div className="w-full mb-4">
            <label className="block text-sm text-gray-600" htmlFor="name">
              Name
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaUser className="text-gray-500 mr-3" />
              <input id="name" type="text" placeholder="Enter your name" className="w-full p-2 bg-transparent outline-none" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <label className="block text-sm text-gray-600" htmlFor="password">
              Password
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaLock className="text-gray-500 mr-3" />
              <input id="password" type={passwordVisible ? "text" : "password"} placeholder="Enter your password" className="w-full p-2 bg-transparent outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={togglePasswordVisibility} className="ml-2">
                {passwordVisible ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="w-full mb-4">
            <label className="block text-sm text-gray-600" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="flex items-center border-b border-gray-300">
              <FaLock className="text-gray-500 mr-3" />
              <input
                id="confirmPassword"
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full p-2 bg-transparent outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" onClick={toggleConfirmPasswordVisibility} className="ml-2">
                {confirmPasswordVisible ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Register</button>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;

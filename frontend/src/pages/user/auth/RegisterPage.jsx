import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../../../components/user/components/Navbar";

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [nim, setNim] = useState("");
  const [fullname, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSuccess, setIsSucess] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible); // Toggle Confirm Password visibility
  };

  const handleRegister = (event) => {
    event.preventDefault();

    const dataRegister = {
      email,
      nim,
      profile: {
        fullname,
      },
      password,
      confirmPassword,
    };

    const fetchRegister = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataRegister),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        const result = await response.json();
        setErrorMessage(null);
        setIsSucess(true);
        return result;
      } catch (error) {
        setErrorMessage(error.message);
        setIsSucess(false);
        return null;
      }
    };

    if (nim.length > 10) {
      return false;
    }

    if (!email && !nim && !fullname && !password && !confirmPassword) {
      return false;
    }

    if (nim.length < 6) {
      setErrorMessage("Nim must contain at least 6 characters");
      return false;
    }

    if (password.length < 6 && confirmPassword.length < 6) {
      setErrorMessage("Password must be contain at least 6 characters");
      return false;
    }

    // check match password and confirm password
    if (confirmPassword !== password) {
      setErrorMessage("Password do Not Match");
      return false;
    }
    fetchRegister();
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
          <p className="text-sm text-gray-600 font-medium">
            If you already have an account
          </p>
          <p className="text-sm text-gray-600 font-medium mb-6">
            You can{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign In here!
            </Link>
          </p>

          <form onSubmit={handleRegister}>
            {/* Email Input */}
            <div className="w-full mb-4">
              <label className="block text-sm text-gray-600" htmlFor="email">
                Email
              </label>
              <div className="flex items-center border-b border-gray-300">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your Email"
                  className="w-full p-2 bg-transparent outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* NIM Input */}
            <div className="w-full mb-4">
              <label className="block text-sm text-gray-600" htmlFor="nim">
                Nim
              </label>
              <div className="flex items-center border-b border-gray-300">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  id="nim"
                  type="text"
                  placeholder="Enter your NIM"
                  className="w-full p-2 bg-transparent outline-none"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                />
              </div>
              {nim.length > 10 && (
                <p className="text-[10px] text-red-600 mt-2">
                  maximum length is 10
                </p>
              )}
            </div>

            {/* Name Input */}
            <div className="w-full mb-4">
              <label className="block text-sm text-gray-600" htmlFor="fullname">
                Fullname
              </label>
              <div className="flex items-center border-b border-gray-300">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  id="fullname"
                  type="text"
                  placeholder="Enter your fullname"
                  className="w-full p-2 bg-transparent outline-none"
                  value={fullname}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="w-full mb-4">
              <label className="block text-sm text-gray-600" htmlFor="password">
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
                  required
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

            {/* Confirm Password Input */}
            <div className="w-full mb-4">
              <label
                className="block text-sm text-gray-600"
                htmlFor="confirmPassword"
              >
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
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="ml-2"
                >
                  {confirmPasswordVisible ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* error message */}
            {errorMessage && (
              <div className="mb-2">
                <p className="text-xs text-center text-red-500">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* success message */}
            {isSuccess && (
              <div className="mb-2">
                <p className="text-xs text-center">
                  Success register account, please{" "}
                  <Link to="/login" className="text-blue-500">
                    login here
                  </Link>
                </p>
              </div>
            )}

            {/* Sign Up Button */}
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;

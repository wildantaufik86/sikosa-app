import React, { useEffect, useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/user/components/Navbar";
import { useAuth } from "../../../hooks/hooks";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorMessagePassword, setErrorMessagePassword] = useState(null);
  const { authUser, handleAuthUserChange } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const dataLogin = {
      email,
      password,
    };

    const fetchDataLogin = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataLogin),
        });

        if (!response.ok) {
          throw new Error("Invalid email or password");
        }
        const result = await response.json();
        handleAuthUserChange(result.user);
        setErrorMessage(null);
        return result;
      } catch (error) {
        setErrorMessage(error.message);
        return null;
      }
    };

    if (email && password) {
      if (password.length < 6) {
        setErrorMessagePassword("password must be minimal 6 character");
      } else {
        setErrorMessagePassword(null);
      }
      fetchDataLogin();
    }

    return false;
  };

  if (authUser) {
    return null;
  }

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
        <div className="flex flex-col justify-center w-full lg:w-2/5  bg-white p-6">
          <h2 className="text-3xl font-bold mb-4 text-[#35A7FF]">Sign In</h2>
          <p className="text-sm text-gray-600 font-medium mb-2">
            If you don't have an account
          </p>
          <p className="text-sm text-gray-600 font-medium mb-6">
            You can{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register here!
            </Link>
          </p>

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="w-full mb-4">
              <label
                className="block text-sm text-gray-600 mb-2"
                htmlFor="email"
              >
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (password.length > 6) {
                      setErrorMessagePassword(null);
                    }
                  }}
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
              {errorMessagePassword && (
                <div className="mt-2">
                  <p className="text-xs text-red-500">{errorMessagePassword}</p>
                </div>
              )}
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

            {/* error message */}
            {errorMessage && (
              <div className="mb-2">
                <p className="text-center text-xs text-red-500">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

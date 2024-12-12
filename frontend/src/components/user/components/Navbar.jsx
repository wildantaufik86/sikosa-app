import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../hooks/hooks";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authUser, handleLogout } = useAuth();
  const [isUserSettingOpen, setIsUserSettingOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const user = {
    name: authUser?.profile?.fullname || "User", // Replace with dynamic user data if available
    image: authUser?.profile?.picture || null, // Replace with the user's profile image URL
  };

  const handleCloseUserSetting = (e) => {
    e.stopPropagation();
    if (isUserSettingOpen) {
      setIsUserSettingOpen(false);
    }
  };

  return (
    <nav
      onClick={handleCloseUserSetting}
      className="bg-white text-white px-6 lg:px-20 py-4 shadow-md font-jakarta sticky top-0 z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="flex items-center">
          <img
            src="/assets/nav-logo.png"
            alt="Logo"
            className="h-7 mr-2 text-[#35A7FF]"
          />
          <span className="text-lg font-bold text-[#35A7FF]">Sikosa</span>
        </NavLink>

        {/* Menu Icon for Mobile */}
        <div className="lg:hidden">
          <button onClick={toggleDrawer}>
            {isOpen ? (
              <FaTimes className="text-[#35A7FF] text-xl" />
            ) : (
              <FaBars className="text-[#35A7FF] text-xl" />
            )}
          </button>
        </div>

        {/* Navigation Links for Desktop */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsUserSettingOpen(false);
          }}
          className="hidden lg:flex space-x-4"
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-[#5DB9FF] ${
                isActive
                  ? "text-[#35A7FF] font-semibold"
                  : "text-black font-semibold"
              }`
            }
          >
            Beranda
          </NavLink>
          <NavLink
            to="/daftar-layanan"
            className={({ isActive }) =>
              `hover:text-[#5DB9FF] ${
                isActive
                  ? "text-[#35A7FF] font-semibold"
                  : "text-black font-semibold"
              }`
            }
          >
            Daftar Layanan
          </NavLink>
          <NavLink
            to="/artikel"
            className={({ isActive }) =>
              `hover:text-[#5DB9FF] ${
                isActive
                  ? "text-[#35A7FF] font-semibold"
                  : "text-black font-semibold"
              }`
            }
          >
            Artikel
          </NavLink>
          {authUser?.role === "mahasiswa" && (
            <NavLink
              to="/riwayat"
              className={({ isActive }) =>
                `hover:text-[#5DB9FF] ${
                  isActive
                    ? "text-[#35A7FF] font-semibold"
                    : "text-black font-semibold"
                }`
              }
            >
              Riwayat
            </NavLink>
          )}
        </div>

        {/* Buttons and User Profile */}
        <div className="hidden lg:flex items-center space-x-2">
          {/* Log in and Register buttons */}
          {!authUser && (
            <>
              <Link to="/login" className="hover:text-blue-300">
                <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">
                  Log in
                </button>
              </Link>
              <Link to="/register" className="hover:text-blue-300">
                <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">
                  Register
                </button>
              </Link>
            </>
          )}

          {/* dashboard for admin */}
          {authUser?.role === "admin" && (
            <Link to="/admin/user" className="hover:text-blue-300">
              <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">
                Dashboard
              </button>
            </Link>
          )}

          {/* User Profile Section */}
          {authUser && (
            <>
              <div
                onClick={() => setIsUserSettingOpen(!isUserSettingOpen)}
                className="flex items-center pl-4 cursor-pointer"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-[#35A7FF] object-cover mr-2"
                  />
                ) : (
                  <div className="flex justify-center items-center w-10 h-10 rounded-full border border-[#35A7FF] mr-2">
                    <FaUser className="text-black" />
                  </div>
                )}
                <span className="text-md font-medium bg-[#35A7FF] text-white py-2 px-4 rounded-lg border border-white">
                  Hi, {user.name.toLowerCase()}
                </span>
              </div>
              <div
                className={`hidden w-[150px] absolute bg-white shadow-md top-full right-28 py-4 rounded-b-md lg:block transition-all origin-top ${
                  isUserSettingOpen ? "scale-y-100" : "scale-y-0"
                }`}
              >
                <div className="flex flex-col px-4 gap-4">
                  <Link
                    to="/profile"
                    className="text-slate-700 text-sm font-semibold transition-all hover:text-[#35A7FF]"
                  >
                    <span className="flex items-center gap-2">
                      <FaUser /> Profile
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all hover:text-[#35A7FF]"
                  >
                    <FiLogOut />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drawer for Mobile and Tablet */}
      <div
        className={`fixed inset-y-0 right-0 bg-white shadow-lg transition-transform transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden z-40 w-1/2`}
      >
        <div className="flex flex-col pt-5">
          <div className="flex justify-between w-full px-7">
            <div></div>
            <button onClick={toggleDrawer}>
              <FaTimes className="text-[#35A7FF] text-xl" />
            </button>
          </div>

          {/* User Profile in the Drawer */}
          {authUser && (
            <div className="flex items-center pl-4 mt-5">
              {user.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-[#35A7FF] object-cover mr-2 shrink-0"
                />
              ) : (
                <div className="flex justify-center items-center w-10 h-10 rounded-full border border-[#35A7FF] mr-2 shrink-0">
                  <FaUser className="text-black" />
                </div>
              )}
              <span className="text-xs font-medium bg-[#35A7FF] text-white py-2 px-4 rounded-lg border border-white lg:text-md">
                Hi, {user.name.split(" ")[0]}
              </span>
            </div>
          )}

          <div className="flex flex-col px-5">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `py-2 text-lg font-semibold ${
                  isActive ? "text-[#35A7FF]" : "text-black"
                }`
              }
              onClick={toggleDrawer}
            >
              Beranda
            </NavLink>
            <NavLink
              to="/daftar-layanan"
              className={({ isActive }) =>
                `py-2 text-lg font-semibold ${
                  isActive ? "text-[#35A7FF]" : "text-black"
                }`
              }
              onClick={toggleDrawer}
            >
              Daftar Layanan
            </NavLink>
            <NavLink
              to="/artikel"
              className={({ isActive }) =>
                `py-2 text-lg font-semibold ${
                  isActive ? "text-[#35A7FF]" : "text-black"
                }`
              }
              onClick={toggleDrawer}
            >
              Artikel
            </NavLink>
            <NavLink
              to="/riwayat"
              className={({ isActive }) =>
                `py-2 text-lg font-semibold ${
                  isActive ? "text-[#35A7FF]" : "text-black"
                }`
              }
              onClick={toggleDrawer}
            >
              Riwayat
            </NavLink>
          </div>

          {/* Buttons inside the Drawer */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {authUser ? (
              <button
                onClick={handleLogout}
                className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white"
              >
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="">
                  <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">
                    Log in
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

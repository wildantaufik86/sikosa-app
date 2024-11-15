import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="bg-white text-white px-6 lg:px-20 py-4 shadow-md font-jakarta sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="flex items-center">
          <img src="/assets/nav-logo.png" alt="Logo" className="h-7 mr-2 text-[#35A7FF]" />
          <span className="text-lg font-bold text-[#35A7FF]">Sikosa</span>
        </NavLink>

        {/* Menu Icon for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleDrawer}>{isOpen ? <FaTimes className="text-[#35A7FF] text-xl" /> : <FaBars className="text-[#35A7FF] text-xl" />}</button>
        </div>

        {/* Navigation Links for Desktop */}
        <div className="hidden md:flex space-x-4">
          <NavLink to="/" className={({ isActive }) => `hover:text-[#5DB9FF] ${isActive ? "text-[#35A7FF] font-semibold" : "text-black font-semibold"}`}>
            Beranda
          </NavLink>
          <NavLink to="/daftar-layanan" className={({ isActive }) => `hover:text-[#5DB9FF] ${isActive ? "text-[#35A7FF] font-semibold" : "text-black font-semibold"}`}>
            Daftar Layanan
          </NavLink>
          <NavLink to="/artikel" className={({ isActive }) => `hover:text-[#5DB9FF] ${isActive ? "text-[#35A7FF] font-semibold" : "text-black font-semibold"}`}>
            Artikel
          </NavLink>
          <NavLink to="/riwayat" className={({ isActive }) => `hover:text-[#5DB9FF] ${isActive ? "text-[#35A7FF] font-semibold" : "text-black font-semibold"}`}>
            Riwayat
          </NavLink>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/login" className="hover:text-blue-300">
            <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">Log in</button>
          </Link>
          <Link to="/register" className="hover:text-blue-300">
            <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">Register</button>
          </Link>
        </div>
      </div>

      {/* Drawer for Mobile and Tablet */}
      <div className={`fixed inset-y-0 right-0 bg-white shadow-lg transition-transform transform ${isOpen ? "translate-x-0" : "translate-x-full"} md:hidden z-40 w-1/2`}>
        <div className="flex flex-col pt-5">
          <div className="flex justify-between w-full px-7">
            <div></div>
            <button onClick={toggleDrawer}>
              <FaTimes className="text-[#35A7FF] text-xl" />
            </button>
          </div>
          <div className="flex flex-col px-5">
            <NavLink to="/" className={({ isActive }) => `py-2 text-lg font-semibold ${isActive ? "text-[#35A7FF]" : "text-black"}`} onClick={toggleDrawer}>
              Beranda
            </NavLink>
            <NavLink to="/daftar-layanan" className={({ isActive }) => `py-2 text-lg font-semibold ${isActive ? "text-[#35A7FF]" : "text-black"}`} onClick={toggleDrawer}>
              Daftar Layanan
            </NavLink>
            <NavLink to="/artikel" className={({ isActive }) => `py-2 text-lg font-semibold ${isActive ? "text-[#35A7FF]" : "text-black"}`} onClick={toggleDrawer}>
              Artikel
            </NavLink>
            <NavLink to="/riwayat" className={({ isActive }) => `py-2 text-lg font-semibold ${isActive ? "text-[#35A7FF]" : "text-black"}`} onClick={toggleDrawer}>
              Riwayat
            </NavLink>
          </div>

          {/* Buttons inside the Drawer */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Link to="/login" className="">
              <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">Log in</button>
            </Link>
            <Link to="/register">
              <button className="bg-[#35A7FF] text-white px-4 py-2 font-semibold rounded hover:bg-[#5DB9FF] hover:text-white">Register</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

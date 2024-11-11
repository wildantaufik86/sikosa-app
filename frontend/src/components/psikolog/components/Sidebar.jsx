import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { IoMdNotificationsOutline, IoMdLogOut } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { BiMessageAlt } from "react-icons/bi";

const PsikologSidebar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const notificationsCount = 5; // Gantilah sesuai dengan jumlah notifikasi yang sebenarnya
  const messagesCount = 3;

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="bg-white">
      {/* Mobile and Tablet Navbar */}
      <div className="flex lg:hidden items-center justify-between py-3 px-5 bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <button className="text-2xl text-gray-800" onClick={toggleDrawer}>
          <FiMenu />
        </button>

        <Link to="/psikolog/dashboard" className="flex items-center space-x-2">
          <img src="/assets/nav-logo.png" alt="Logo" className="w-5 h-5 object-cover" />
          <h2 className="text-xl font-bold text-[#35A7FF]">Sikosa</h2>
        </Link>
      </div>

      {/* Sidebar / Drawer for larger screens */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white py-2 px-3 transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform lg:translate-x-0 lg:static z-50 shadow-lg min-h-screen flex flex-col justify-between font-jakarta`}
      >
        <div>
          {/* Close Button for Drawer */}
          <button className="absolute top-4 right-4 text-gray-800 text-2xl lg:hidden" onClick={toggleDrawer}>
            <AiOutlineClose />
          </button>

          {/* Sidebar Header with Logo and Title */}
          <Link to="/psikolog/dashboard" className="flex items-center p-3 space-x-1">
            <img src="/assets/nav-logo.png" alt="Logo" className="w-5 h-5 object-cover" />
            <h2 className="text-xl font-bold text-[#35A7FF]">Sikosa</h2>
          </Link>

          {/* Sidebar Navigation Links */}
          <ul className="space-y-2">
            <li>
              <NavLink to="/psikolog/dashboard" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "text-gray-800 hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}>
                Beranda
              </NavLink>
            </li>
            <li>
              <NavLink to="/psikolog/artikel" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "text-gray-800 hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}>
                Artikel
              </NavLink>
            </li>
            <li>
              <NavLink to="/psikolog/profile" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "text-gray-800 hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/psikolog/layanan" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "text-gray-800 hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}>
                Layanan Saya
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Profile, Messages, Notifications, Logout */}
        <div className="flex flex-col items-start py-2 space-y-4">
          <div className="w-full flex flex-col justify-between">
            {/* Messages NavLink */}
            <NavLink
              to="/psikolog/messages"
              className={({ isActive }) => `flex items-center justify-between space-x-2 text-gray-800 py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}
            >
              <div className="flex items-center space-x-2">
                <BiMessageAlt className="text-lg" />
                <span className="text-sm font-semibold">Messages</span>
              </div>
              {messagesCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold py-1 px-2 rounded-full">{messagesCount}</span>}
            </NavLink>

            {/* Notifications NavLink */}
            <NavLink
              to="/psikolog/notifications"
              className={({ isActive }) => `flex justify-between items-center space-x-2 text-gray-800 py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}
            >
              <div className="flex items-center space-x-2">
                <IoMdNotificationsOutline className="text-lg" />
                <span className="text-sm font-semibold">Notifications</span>
              </div>
              {notificationsCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold py-1 px-2 rounded-full">{notificationsCount}</span>}
            </NavLink>

            {/* Logout NavLink */}
            <NavLink to="/psikolog/logout" className={({ isActive }) => `flex items-center space-x-2 text-gray-800 py-2 px-4 rounded ${isActive ? "bg-[#EFF6FF] text-[#35A7FF]" : "hover:bg-[#EFF6FF] hover:text-[#35A7FF]"}`}>
              <IoMdLogOut className="text-lg" />
              <span className="text-sm font-semibold">Logout</span>
            </NavLink>
          </div>

          {/* Profile Section */}
          <div className="flex items-center px-4 space-x-4">
            <img src="/assets/home-image.png" alt="Profile" className="w-12 h-12 object-cover rounded-full" />
            <div>
              <p className="font-semibold text-md text-gray-800">John Doe</p>
              <p className="text-gray-500 text-xs">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for Drawer */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black opacity-50 lg:hidden z-40" onClick={toggleDrawer} />}
    </div>
  );
};

export default PsikologSidebar;

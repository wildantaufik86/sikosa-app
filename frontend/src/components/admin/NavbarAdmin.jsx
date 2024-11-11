// src/components/AdminNavbar.jsx

import React from "react";
import { Link } from "react-router-dom"; // Make sure you have react-router-dom installed
import { FaTachometerAlt, FaUsers, FaClipboardList, FaCog } from "react-icons/fa"; // Importing React Icons

const AdminNavbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Admin Dashboard</div>
        <div className="flex items-center space-x-4">
          <Link to="/admin/profile" className="text-white hover:text-gray-300">
            Profile
          </Link>
          <Link to="/admin/logout" className="text-white hover:text-gray-300">
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

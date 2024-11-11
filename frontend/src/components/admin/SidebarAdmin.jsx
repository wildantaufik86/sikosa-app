// src/components/AdminSidebar.jsx

import React from "react";
import { Link } from "react-router-dom"; // Make sure you have react-router-dom installed
import { FaTachometerAlt, FaUsers, FaClipboardList, FaCog } from "react-icons/fa"; // Importing React Icons

const AdminSidebar = () => {
  return (
    <aside className="bg-gray-800 w-64 p-5">
      <ul className="space-y-2">
        <li>
          <Link to="/admin/dashboard" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
            <FaTachometerAlt className="mr-2" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/users" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
            <FaUsers className="mr-2" />
            Users
          </Link>
        </li>
        <li>
          <Link to="/admin/sessions" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
            <FaClipboardList className="mr-2" />
            Sessions
          </Link>
        </li>
        <li>
          <Link to="/admin/settings" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
            <FaCog className="mr-2" />
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default AdminSidebar;

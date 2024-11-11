// src/layouts/AdminLayout.jsx

import React from "react";

import Footer from "../components/Footer";
import AdminNavbar from "../components/admin/NavbarAdmin";
import AdminSidebar from "../components/admin/SidebarAdmin";

const AdminLayout = ({ children }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <AdminNavbar /> {/* Use AdminNavbar here */}
      <div className="flex flex-1">
        <AdminSidebar /> {/* Use AdminSidebar here */}
        <main className="flex-1 p-5">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;

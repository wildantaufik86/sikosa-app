import React, { useEffect } from "react";
import Footer from "../components/Footer";
import AdminSidebar from "../components/admin/SidebarAdmin";
import { useAuth } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";

const PsikologLayout = ({ children }) => {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser || authUser?.role !== "admin") {
      navigate("/");
    }
  }, [authUser]);

  if (!authUser || authUser?.role !== "admin") {
    return null;
  }

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col">
        {/* Apply flex-col on mobile and tablet, and flex-row on desktop */}
        <div className="flex flex-col lg:flex-row flex-1">
          <AdminSidebar />
          <main className="flex-1 p-5 overflow-y-auto  lg:h-screen">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PsikologLayout;

import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/user/components/Navbar";
import Footer from "../components/Footer";
import { FaComments } from "react-icons/fa";
import ChatPopup from "../components/user/components/chatpopup/ChatPopup";
import { useAuth } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";

const UserLayout = ({ children }) => {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const { authUser } = useAuth();
  useEffect(() => {
    if (authUser && authUser?.role === "dokter") {
      navigate("/psikolog/dashboard");
    }
  }, [authUser]);

  if (authUser && authUser?.role === "dokter") {
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Chat Icon */}
      <div
        onClick={toggleChat}
        className="fixed z-20 bottom-7 right-7 lg:bottom-16 lg:right-20 bg-[#35A7FF] text-white rounded-full p-3 shadow-lg hover:bg-[#5DB9FF] cursor-pointer transition"
      >
        <FaComments className="h-6 w-6" />
      </div>

      {/* Chat Popup */}
      {showChat && <ChatPopup onClose={toggleChat} />}
    </div>
  );
};

export default UserLayout;

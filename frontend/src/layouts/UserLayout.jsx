import React, { useState } from "react";
import Navbar from "../components/user/components/Navbar";
import Footer from "../components/Footer";
import { FaComments } from "react-icons/fa";
import ChatPopup from "../components/user/components/chatpopup/ChatPopup";

const UserLayout = ({ children }) => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Chat Icon */}
      <div onClick={toggleChat} className="fixed bottom-7 right-7 lg:bottom-16 lg:right-20 bg-[#35A7FF] text-white rounded-full p-3 shadow-lg hover:bg-[#5DB9FF] cursor-pointer transition">
        <FaComments className="h-6 w-6" />
      </div>

      {/* Chat Popup */}
      {showChat && <ChatPopup onClose={toggleChat} />}
    </div>
  );
};

export default UserLayout;

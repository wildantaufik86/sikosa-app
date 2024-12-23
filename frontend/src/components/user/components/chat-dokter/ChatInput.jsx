// ChatInput.js
import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const ChatInput = ({ message, setMessage, handleSendMessage }) => {
  return (
    <form onSubmit={handleSendMessage} className="flex items-center space-x-2 border-t pt-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
        placeholder="Tulis pesan..."
      />
      <button type="submit" className="bg-[#35A7FF] text-white p-2 rounded-full hover:bg-[#5DB9FF]">
        <FaPaperPlane />
      </button>
    </form>
  );
};

export default ChatInput;

import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const ChatPopup = () => {
  return (
    <section className="fixed bottom-20 right-7 lg:bottom-16 lg:right-36 bg-[#C2E5FF] p-6 rounded-lg sm:w-80 md:w-full sm:max-w-sm md:max-w-lg shadow-lg z-50">
      <div className="flex flex-col space-y-4 overflow-y-auto max-h-80">
        {/* Chatbox content */}
        <article className="flex flex-col space-y-4">
          {/* Chat bubble from user */}
          <div className="flex items-start space-x-2">
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="w-8 h-8 my-auto rounded-full" />
            <div className="bg-[#35A7FF] text-white p-3 rounded-lg max-w-[80%]">Hi, I need help with my order!</div>
          </div>

          {/* Chat bubble from support */}
          <div className="flex items-start space-x-2 flex-row-reverse">
            <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="Support" className="w-8 h-8 rounded-full my-auto ml-1" />
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[80%]">Sure! How can I assist you with that?</div>
          </div>
        </article>
      </div>

      {/* Input and send button */}
      <footer className="flex items-center space-x-2 mt-4">
        <input type="text" placeholder="Type your message..." className="w-full p-3 border border-gray-300 rounded-md" />
        <button className="bg-[#35A7FF] text-white p-3 rounded-full hover:bg-[#5DB9FF]">
          <FaPaperPlane className="text-lg" />
        </button>
      </footer>
    </section>
  );
};

export default ChatPopup;

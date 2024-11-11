import { useState } from "react";
import { FiVideo, FiInfo, FiPaperclip, FiSearch } from "react-icons/fi";

const MessagePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const messages = [
    { id: 1, name: "John Doe", message: "Hello, how are you?", image: "/assets/caroulsel1.png" },
    { id: 2, name: "Jane Smith", message: "Let's meet up tomorrow.", image: "/assets/caroulsel2.png" },
    // Add more messages as needed
  ];

  return (
    <div className="flex pt-16 lg:pt-0 lg:px-4 h-screen flex-col lg:flex-row">
      {/* Left Container */}
      <div className="w-full lg:w-1/3 pr-4 h-full mb-6 lg:mb-0 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        {/* Search Input */}
        <div className="mb-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 pl-10 border border-gray-500 rounded-lg focus:outline-none focus:border-[#35A7FF] text-gray-700"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Message List */}
        <div className="space-y-4 overflow-y-auto h-3/4">
          {messages
            .filter((message) => message.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((message) => (
              <div key={message.id} className="flex items-center space-x-4 p-2 border-b border-gray-300 hover:bg-gray-100 rounded-lg cursor-pointer">
                <img src={message.image} alt={message.name} className="w-12 h-12 object-cover rounded-full" />
                <div>
                  <h3 className="font-medium">{message.name}</h3>
                  <p className="text-sm text-gray-500">{message.message}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Container */}
      <div className="w-full lg:w-2/3 pl-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center mb-6">
          {/* Profile Image and Name */}
          <div className="relative">
            <img src="/assets/caroulsel1.png" alt="Profile" className="w-10 h-10 object-cover rounded-full" />
          </div>
          <div className="ml-4">
            <h3 className="text-md font-semibold">John Doe</h3>
            <p className="text-sm text-green-500">Online</p>
          </div>

          {/* Video Call and Info Icons */}
          <div className="ml-auto flex space-x-4">
            <FiVideo className="text-gray-600 cursor-pointer" />
            <FiInfo className="text-gray-600 cursor-pointer" />
          </div>
        </div>

        {/* Add margin to separate profile and chat bubbles */}
        <div className="mb-6"></div>

        {/* Chat Bubble Section */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[calc(100vh-210px)]">
          <div className="flex items-start">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
              <p>Hey, what's up?</p>
            </div>
          </div>
          <div className="flex items-start justify-end">
            <div className="bg-gray-300 p-3 rounded-lg max-w-xs">
              <p>Not much, just chilling.</p>
            </div>
          </div>
        </div>

        {/* Send Message Section */}
        <div className="flex items-center space-x-4 border-t pt-4">
          {/* File Attachment Icon */}
          <FiPaperclip className="text-gray-600 cursor-pointer" />
          {/* Message Input */}
          <input type="text" placeholder="Type a message" className="w-full p-2 focus:outline-none" />
          {/* Send Button */}
          <button className="text-[#35A7FF] p-2">Send</button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;

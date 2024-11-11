// ChatMessages.js
import React from "react";
import { motion } from "framer-motion";

const PesanChat = ({ messages, doctorImage }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="h-80 lg:h-96 overflow-y-auto mb-4 flex-grow">
      {messages.map((msg, index) => (
        <div key={index} className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
          {msg.sender === "doctor" && <img src={doctorImage} alt="Doctor" className="w-8 h-8 object-cover rounded-full mr-2" />}
          <div className={`p-2 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-white text-black"}`}>{msg.content}</div>
          {msg.sender === "user" && <img src="https://via.placeholder.com/50" alt="User" className="w-8 h-8 object-cover rounded-full ml-2" />}
        </div>
      ))}
    </motion.div>
  );
};

export default PesanChat;

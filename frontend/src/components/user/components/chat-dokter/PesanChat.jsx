// ChatMessages.js
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../hooks/hooks";
import CONFIG from "../../../../config/config";

const PesanChat = ({ messages, psikolog }) => {
  const { authUser } = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="h-80 lg:h-96 overflow-y-auto mb-4 flex-grow"
    >
      {messages.map((msg, index) => (
        <div key={index} className={`flex mb-3 ${msg.senderId === authUser._id ? "justify-end" : "justify-start"}`}>
          {msg.senderId === psikolog._id && (
            <img
              src={CONFIG.BASE_URL + psikolog.profile.picture}
              alt="Doctor"
              className="w-8 h-8 object-cover rounded-full mr-2"
            />
          )}
          <div
            className={`p-2 rounded-lg max-w-xs ${
              msg.senderId === authUser._id ? "bg-blue-500 text-white" : "bg-white text-black"
            }`}
          >
            {msg.message}
          </div>
          {msg.senderId === authUser._id && (
            <img src={CONFIG.BASE_URL + authUser.profile.picture} alt="User" className="w-8 h-8 object-cover rounded-full ml-2" />
          )}
        </div>
      ))}
    </motion.div>
  );
};

export default PesanChat;

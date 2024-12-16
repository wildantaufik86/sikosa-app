import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ServiceCard = ({ service, index }) => (
  <motion.div
    key={service.id}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.4, duration: 0.8 }}
    className="bg-white p-4 rounded-lg shadow-md text-center flex flex-col"
  >
    <Link to="/daftar-layanan/1" className="mb-4">
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-48 object-cover rounded-md"
      />
    </Link>
    <Link
      to="/daftar-layanan/675f8e51b56e09944e7dae27"
      className="text-xl font-semibold my-3 text-[#35A7FF]"
    >
      {service.name}
    </Link>

    {/* Chat Button as a Link */}
    <Link
      to={`/chat-dokter/675f8e51b56e09944e7dae27`} // Update the path as needed
      className="bg-[#35A7FF] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5DB9FF] mx-auto flex items-center justify-center"
    >
      Chat
    </Link>
  </motion.div>
);

export default ServiceCard;

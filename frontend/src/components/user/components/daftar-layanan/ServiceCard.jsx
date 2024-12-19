import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CONFIG from "../../../../config/config";
import { formattedString } from "../../../../utils/utils";

const ServiceCard = ({ data, index }) => (
  <motion.div
    key={data.id}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.4, duration: 0.8 }}
    className="bg-white p-4 rounded-lg shadow-md text-center flex flex-col"
  >
    <Link to={`/daftar-layanan/${data.id}`} className="mb-4">
      <img
        src={
          data.profile.picture
            ? CONFIG.BASE_URL + data.profile.picture
            : "https://via.placeholder.com/150"
        }
        alt={data.profile.fullname}
        className="w-full h-48 object-cover rounded-md"
      />
    </Link>
    <Link
      to={`/daftar-layanan/${data.id}`}
      className="text-lg font-semibold my-3 text-[#35A7FF]"
    >
      {formattedString(data.profile.fullname)}
    </Link>

    {/* detail Button as a Link */}
    <Link
      to={`/daftar-layanan/${data.id}`} // Update the path as needed
      className="bg-[#35A7FF] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5DB9FF] mx-auto flex items-center justify-center"
    >
      Detail
    </Link>
  </motion.div>
);

export default ServiceCard;

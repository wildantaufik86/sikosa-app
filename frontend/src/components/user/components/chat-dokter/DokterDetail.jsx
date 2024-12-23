// DoctorDetails.js
import React from "react";
import { motion } from "framer-motion";
import CONFIG from "../../../../config/config";

const DokterDetail = ({ psikolog }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full lg:w-1/3 border p-4 rounded-lg shadow-lg mb-4 lg:mb-0"
    >
      <img
        src={CONFIG.BASE_URL + psikolog.profile.picture}
        alt={psikolog.profile.fullname}
        className="w-full h-64 rounded-md object-cover mb-4 mx-auto"
      />
      <h3 className="text-2xl text-[#35A7FF] font-semibold text-center mb-4">{psikolog.profile.fullname}</h3>
      <div>
        <h4 className="text-lg font-semibold mb-2">Profil Dokter:</h4>
        <p className="text-gray-700 mb-4 p-2 text-md font-medium text-justify rounded-md border border-[#35A7FF]">
          {psikolog.profile.description}
        </p>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-2">Riwayat Pendidikan:</h4>
        <ul className="list-disc pl-6 text-gray-700 p-2 text-md font-medium text-justify rounded-md border border-[#35A7FF]">
          {psikolog.profile.educationBackground.map((edu, index) => (
            <li key={index} className="mb-2">
              {edu}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default DokterDetail;

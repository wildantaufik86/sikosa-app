import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  return (
    <div className="flex flex-col justify-center py-8 lg:py-10 px-6 lg:px-20 font-jakarta bg-white">
      {/* Title */}
      <h1 className="text-xl font-bold mb-4 w-full text-left max-w-4xl">Profil</h1>

      {/* Profile Card */}
      <motion.div className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <motion.div className="flex flex-col md:flex-row" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          {/* Profile Image */}
          <motion.div className="w-full md:w-1/2 flex justify-center items-center border border-black rounded-xl p-2 mb-4 md:mb-0" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
            <img
              src="/assets/caroulsel1.png" // Ganti dengan URL gambar profil Anda
              alt="Profile"
              className="w-full h-80 object-cover rounded-lg"
            />
          </motion.div>

          {/* Profile Details */}
          <motion.div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
            <div className="space-y-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <p className="text-black text-md font-semibold mb-1">NIM</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">123456789</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <p className="text-black text-md font-semibold mb-1">Nama</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">Nama Mahasiswa</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <p className="text-black text-md font-semibold mb-1">Tanggal Lahir</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">01 Januari 2000</p>
              </motion.div>
            </div>

            {/* Edit Profile Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <Link to="/edit-profile/1" className="mt-4 bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 self-start">
                Edit Profil
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;

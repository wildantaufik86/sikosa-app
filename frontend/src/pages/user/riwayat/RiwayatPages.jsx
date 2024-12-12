import React, { useEffect } from "react";
import { FaChevronLeft, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import RiwayatTabel from "../../../components/user/components/riwayat/RiwayatTabel";
import SearchRiwayat from "../../../components/user/components/riwayat/SearchRiwayat";
import { motion } from "framer-motion"; // Import Framer Motion
import { useAuth } from "../../../hooks/hooks";

const RiwayatPages = () => {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser]);

  if (!authUser) {
    return null;
  }

  return (
    <>
      <motion.div
        className="py-8 bg-white lg:py-10 px-6 lg:px-20 font-jakarta"
        initial={{ opacity: 0 }} // Start with opacity 0
        animate={{ opacity: 1 }} // Fade in to opacity 1
        transition={{ duration: 0.9, delay: 0.3 }} // Fade transition duration
      >
        {/* Breadcrumb */}
        <motion.div
          className="mb-4 text-sm text-gray-700 flex items-center space-x-2"
          initial={{ y: -20, opacity: 0 }} // Initial position above and hidden
          animate={{ y: 0, opacity: 1 }} // Animate to its normal position with full opacity
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <Link to="/" className="hover:text-blue-500">
            Beranda
          </Link>{" "}
          <span>&gt;</span>
          <span className="font-semibold">Riwayat</span>
        </motion.div>

        {/* Search Component with Animation */}
        <motion.div
          initial={{ opacity: 0, x: -100 }} // Start from the left with hidden opacity
          animate={{ opacity: 1, x: 0 }} // Animate to its normal position with full opacity
          transition={{ duration: 0.8 }}
        >
          <SearchRiwayat />
        </motion.div>

        {/* Table Component with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} // Start slightly below and hidden
          animate={{ opacity: 1, y: 0 }} // Animate to its normal position with full opacity
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <RiwayatTabel />
        </motion.div>
      </motion.div>
    </>
  );
};

export default RiwayatPages;

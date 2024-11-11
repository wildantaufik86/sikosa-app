import React, { useState } from "react";
import { motion } from "framer-motion";
import LayananItem from "../../../components/user/components/layanan/LayananItem";
import Pagination from "../../../components/user/components/layanan/LayananPagination";
import ReasonsSection from "../../../components/user/components/layanan/reasonsection";

const layananData = [
  { id: 1, image: "https://via.placeholder.com/150", name: "Layanan 1", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
  { id: 2, image: "https://via.placeholder.com/150", name: "Layanan 2", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
  { id: 3, image: "https://via.placeholder.com/150", name: "Layanan 3", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
  { id: 4, image: "https://via.placeholder.com/150", name: "Layanan 4", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
  { id: 5, image: "https://via.placeholder.com/150", name: "Layanan 5", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
  { id: 6, image: "https://via.placeholder.com/150", name: "Layanan 6", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit" },
];

const DaftarLayanan = () => {
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(layananData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentLayanan = layananData.slice(startIdx, startIdx + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-[#EBF6FF] py-10 px-6 lg:px-20 font-jakarta">
      {/* Title Section with Scroll-Triggered Animation */}
      <motion.h1 className="text-2xl font-bold mb-2 lg:mb-3" initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
        Daftar Layanan
      </motion.h1>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row py-7 items-start gap-8 space-x-2">
        {/* Left: Grid layanan */}
        <div className="w-full lg:w-1/2 flex flex-col my-auto justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLayanan.map((layanan) => (
              <motion.div key={layanan.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: layanan.id * 0.1 }} viewport={{ once: true }}>
                <LayananItem layanan={layanan} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} handlePrev={handlePrev} handleNext={handleNext} setCurrentPage={setCurrentPage} />
        </div>

        {/* Right: Description */}
        <div className="w-full lg:w-1/2">
          <motion.h1 className="text-xl lg:text-2xl w-full lg:w-3/4 font-bold mb-4" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            Kami Ada untuk Mendampingi Perjalanan Kesehatan Mental Anda
          </motion.h1>
          <motion.h3 className="text-lg font-semibold mb-3 text-[#2A87CE]" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
            Mengapa Memilih Layanan Kami?
          </motion.h3>

          {/* Reasons Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
            <ReasonsSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DaftarLayanan;

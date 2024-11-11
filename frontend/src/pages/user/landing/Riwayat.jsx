import React from "react";
import { motion } from "framer-motion";
import RiwayatTabel from "../../../components/user/components/riwayat/RiwayatTabel";
import ViewAllButton from "../../../components/user/components/riwayat/ViewAllButton";

const RiwayatPage = () => {
  return (
    <div className="container mx-auto pb-16 px-6 lg:px-20 font-jakarta">
      {/* Title with Animation */}
      <motion.div className="flex justify-between items-center mb-3" initial={{ opacity: 0, y: -30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} viewport={{ once: true }}>
        <h1 className="text-2xl font-bold text-black">Riwayat</h1>
      </motion.div>

      {/* View All Button with Animation */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
        <ViewAllButton />
      </motion.div>

      {/* Table with Animation */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} viewport={{ once: true }}>
        <RiwayatTabel />
      </motion.div>
    </div>
  );
};

export default RiwayatPage;

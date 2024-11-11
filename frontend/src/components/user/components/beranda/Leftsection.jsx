import React from "react";
import { motion } from "framer-motion";
import ChecklistItem from "./ChecklistItem";

const LeftSection = () => {
  return (
    <div className="md:w-3/5 mt-5 lg:mt-0 flex flex-col justify-center items-start order-2 md:order-1 relative -top-8">
      {/* Animated Tagline */}
      <motion.p className="text-[#103755] mb-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} viewport={{ once: true }}>
        Berani Bercerita, Bersama Kita
      </motion.p>

      {/* Animated Title */}
      <motion.h1
        className="text-xl lg:text-3xl font-bold mb-4 text-left w-full lg:w-3/5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        Dapatkan dukungan dan layanan psikologi yang kamu cari, semuanya ada di sini.
      </motion.h1>

      {/* Checklist Items with Animations */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} viewport={{ once: true }}>
        <ChecklistItem text="Pendekatan yang Fleksibel dan Sesuai Kebutuhan" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }} viewport={{ once: true }}>
        <ChecklistItem text="Kerahasiaan Terlindungi dengan Aman" />
      </motion.div>
    </div>
  );
};

export default LeftSection;

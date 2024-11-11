import React from "react";
import { motion } from "framer-motion";

const TitleAndDescription = () => (
  <div>
    <motion.h2 className="text-2xl font-bold mb-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
      Rekomendasi Dokter
    </motion.h2>
    <motion.p className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
      Bicarakan kesehatan mental anda bersama kami.
    </motion.p>
  </div>
);

export default TitleAndDescription;

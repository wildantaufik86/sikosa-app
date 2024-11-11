import React from "react";
import { motion } from "framer-motion";

const RightSection = () => {
  return (
    <motion.div className="md:w-2/5 flex justify-center mb-8 md:mb-0 order-1 md:order-2" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true }}>
      <img src="/assets/home-image.png" alt="Descriptive Alt Text" className="w-2/3 h-auto" />
    </motion.div>
  );
};

export default RightSection;

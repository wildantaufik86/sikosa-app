import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LayananItem from "../../../components/user/components/layanan/LayananItem";
import Pagination from "../../../components/user/components/layanan/LayananPagination";
import ReasonsSection from "../../../components/user/components/layanan/reasonsection";
import { getAllPsikolog } from "../../../utils/api";
import { useAuth } from "../../../hooks/hooks";

const DaftarLayanan = () => {
  const { authUser } = useAuth();
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [psikologs, setPsikologs] = useState([]);

  const totalPages = Math.ceil(psikologs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentLayanan = psikologs.slice(startIdx, startIdx + itemsPerPage);

  // dummy data psikolog when user not log in
  const dummyPsikologs = [
    {
      profile: {
        picture: "/assets/login.png",
        fullname: "psikolog",
        description: "",
        educationBackground: [],
        specialization: "psikolog",
      },
      _id: "1",
      email: "",
      nim: "",
      verified: false,
      role: "psikolog",
      __v: 1,
    },
  ];

  useEffect(() => {
    const fetchPsikologs = async () => {
      try {
        const response = await getAllPsikolog();
        if (response.error) {
          throw new Error("Failed to get psikologs");
        }
        const validatedPsikologs = response.psikologs.filter((data) => {
          return (
            data.profile.picture !== "" &&
            data.profile.fullname !== "" &&
            data.profile.description !== "" &&
            data.profile.specialization !== "" &&
            data.profile.educationBackground.length !== 0
          );
        });
        setPsikologs(validatedPsikologs);
      } catch (error) {
        console.log(error.message);
      }
    };
    if (authUser) {
      fetchPsikologs();
    } else {
      setPsikologs(dummyPsikologs);
    }
  }, [authUser]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-[#EBF6FF] py-10 px-6 lg:px-20 font-jakarta">
      {/* Title Section with Scroll-Triggered Animation */}
      <motion.h1
        className="text-2xl font-bold mb-2 lg:mb-3"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Daftar Layanan
      </motion.h1>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row py-7 items-start gap-8 space-x-2">
        {/* Left: Grid layanan */}
        <div className="w-full lg:w-1/2 flex flex-col my-auto justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLayanan.map((data, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: data.id * 0.1 }}
                viewport={{ once: true }}
              >
                <LayananItem data={data} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePrev={handlePrev}
            handleNext={handleNext}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Right: Description */}
        <div className="w-full lg:w-1/2">
          <motion.h1
            className="text-xl lg:text-2xl w-full lg:w-3/4 font-bold mb-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Kami Ada untuk Mendampingi Perjalanan Kesehatan Mental Anda
          </motion.h1>
          <motion.h3
            className="text-lg font-semibold mb-3 text-[#2A87CE]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Mengapa Memilih Layanan Kami?
          </motion.h3>

          {/* Reasons Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <ReasonsSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DaftarLayanan;

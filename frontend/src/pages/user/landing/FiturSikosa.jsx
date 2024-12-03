import { motion } from "framer-motion";

const FiturSikosa = () => {
  return (
    <div className="bg-white p-4 flex flex-col sm:flex-row sm:py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="flex-1 p-8 flex justify-center items-center"
      >
        <img
          src="/assets/sikosa-doctor.png"
          alt="sikosa doctor img"
          className="w-[350px] sm:w-[250px] md:w-[400px]"
        />
      </motion.div>
      {/* content */}
      <motion.div
        className="flex-1 flex flex-col items-center gap-2 px-4"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-[90%]">
          <h3 className="text-lg font-bold sm:text-2xl">
            Temukan Ruang untuk Berbagi Kisah Anda{" "}
            <span className="text-textColorSecondary">
              dengan Layanan Sikosa
            </span>
          </h3>
          <p className="text-xs mt-2 text-[#2A87CE] sm:text-xs">
            Pilih metode konseling yang sesuai dengan kebutuhan Anda dan mulai
            perjalanan menuju kesehatan mental yang lebih baik.
          </p>
        </div>
        {/* list fitur */}
        <div className="flex flex-col items-center gap-4 mt-8 pb-4">
          {[...Array(3)].map((_, i) => (
            <div className="flex items-center gap-4 bg-[#EBF6FF] w-[250px] rounded-lg p-4 shadow-md md:w-[300px]">
              <div className="w-[30%] flex justify-center items-center">
                {i === 0 && (
                  <img
                    src="/assets/icons/chat-bot-icon.png"
                    alt="chat bot icon"
                    className="w-[30px] md:w-[35px]"
                  />
                )}
                {i === 1 && (
                  <img
                    src="/assets/icons/artikel-icon.png"
                    alt="artikel icon"
                    className="w-[30px] md:w-[35px]"
                  />
                )}
                {i === 2 && (
                  <img
                    src="/assets/icons/chat-icon.png"
                    alt="chat icon"
                    className="w-[30px] md:w-[35px]"
                  />
                )}
              </div>
              <div className="w-full flex flex-col">
                <h4 className="text-sm font-bold">
                  {i === 0 && "Chat Bot"}
                  {i === 1 && "Artikel"}
                  {i === 2 && "Chat Psikolog"}
                </h4>
                <p className="text-[10px]">
                  {i === 0 &&
                    "Asisten virtual untuk pertanyaan awal dan panduan cepat."}
                  {i === 1 &&
                    "Informasi dan tips kesehatan mental yang terpercaya"}
                  {i === 2 && "Terhubung langsung dengan psikolog profesional"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FiturSikosa;

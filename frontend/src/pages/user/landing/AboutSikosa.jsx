import { motion } from "framer-motion";

const AboutSikosa = () => {
  return (
    <div className="mt-8 bg-[#EBF6FF] flex flex-col font-jakarta lg:flex-row items-center">
      <div className="px-[8%] flex flex-col p-8 lg:w-[65%]">
        <motion.h3
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Apa itu <span className="text-textColorSecondary">Sikosa</span>?
        </motion.h3>
        <motion.p
          className="text-base mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <span className="text-textColorSecondary">Sikosa</span> (Sistem
          Konseling dan Psikologi Mahasiswa) adalah platform digital yang
          membantu mahasiswa mendapatkan layanan konseling, membaca artikel
          kesehatan mental, dan mengelola riwayat konsultasi secara mudah dan
          aman. SiKosa menghubungkan mahasiswa dengan psikolog profesional untuk
          mendukung kesehatan mental mereka.
        </motion.p>
      </div>
      <div className="relative mt-8 p-8 overflow-hidden sm:w-full">
        {/* Circle */}
        <div className="bg-white w-[400px] h-[200px] rounded-t-full absolute left-1/2 transform -translate-x-1/2 z-0 sm:w-[600px] sm:h-[300px] md:w-[650px] md:h-[325px] lg:w-[700px] lg:h-[350px]"></div>

        {/* Content */}
        <motion.div
          className="flex flex-col relative z-[2] mt-4 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="flex font-bold justify-center items-center">
            <span className="text-5xl text-textColorSecondary">3</span>
            <p className="text-2xl w-[55%]">tanda kamu butuh konseling</p>
          </h3>
          <motion.div
            className="grid grid-cols-1 mt-4 py-4 gap-3 place-items-center auto-rows-[1fr] sm:grid-cols-3 sm:gap-4 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="max-w-[300px] sm:max-w-[150px] h-full p-4 rounded-sm flex flex-col bg-[#EBF6FF] shadow-lg text-textColorPrimary]"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <p className="text-[10px] lg:text-xs">
                  {i === 0 && "Menyakiti atau membahayakan diri sendiri"}
                  {i === 1 && "Menyakiti atau membahayakan orang lain"}
                  {i === 2 && "Mengganggu kehidupan sehari-hari"}
                </p>
                <p className="text-[10px] mt-4 lg:text-xs">
                  {i === 0 &&
                    "(e.g: Merasa harga diri rendah, pikiran yang menyakiti diri sendiri, gangguan nafsu makan)"}
                  {i === 1 &&
                    "(e.g: Sulit mengontrol emosi hingga melakukan kekerasan kepada orang lain)"}
                  {i === 2 &&
                    "(e.g: Tidak bisa tidur sehingga sulit fokus di pekerjaan, hilang nafsu makan hingga sakit fisik)"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutSikosa;

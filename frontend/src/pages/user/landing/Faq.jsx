import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Apa itu kesehatan mental, dan mengapa itu penting?",
      answer:
        "Kesehatan mental mencakup kesejahteraan emosional, psikologis, dan sosial kita. Ini memengaruhi cara kita berpikir, merasa, dan bertindak. Kesehatan mental yang baik penting untuk menjalani kehidupan yang seimbang dan produktif.",
    },
    {
      question: "Bagaimana saya tahu jika saya membutuhkan bantuan psikolog?",
      answer:
        "Jika Anda merasa cemas, tertekan, sulit tidur, kehilangan minat dalam aktivitas, atau merasa sulit untuk mengontrol emosi, ini bisa menjadi tanda bahwa Anda perlu berkonsultasi dengan psikolog.",
    },
    {
      question: "Apakah wajar untuk merasa cemas setiap hari?",
      answer:
        "Merasa cemas dalam situasi tertentu adalah hal yang normal, tetapi jika kecemasan terjadi setiap hari dan mengganggu aktivitas Anda, ini bisa menjadi tanda gangguan kecemasan yang memerlukan bantuan profesional.",
    },
    {
      question: "Apa yang dimaksud dengan depresi, dan bagaimana cara mengatasinya?",
      answer:
        "Depresi adalah kondisi kesehatan mental yang ditandai oleh perasaan sedih yang mendalam, kehilangan minat, dan penurunan energi. Pengobatan biasanya melibatkan terapi psikologis, perubahan gaya hidup, dan kadang-kadang obat-obatan.",
    },
    {
      question: "Bagaimana cara mengelola stres yang berlebihan?",
      answer:
        "Mengelola stres dapat dilakukan melalui teknik relaksasi seperti meditasi, olahraga, menjaga pola makan sehat, tidur cukup, dan berbicara dengan seseorang yang Anda percayai, termasuk psikolog.",
    },
    {
      question: "Apakah ada stigma yang melekat pada orang yang mencari bantuan psikologis?",
      answer:
        "Sayangnya, masih ada stigma terhadap kesehatan mental, tetapi semakin banyak orang yang mulai menyadari pentingnya mencari bantuan untuk kesejahteraan mental mereka. Tidak ada yang salah dengan meminta bantuan.",
    },
    {
      question: "Apakah sesi konseling cocok untuk semua orang?",
      answer:
        "Sesi konseling dapat bermanfaat bagi siapa saja yang ingin memahami diri mereka lebih baik, mengatasi masalah emosional, atau meningkatkan kualitas hidup mereka. Tidak ada salahnya mencoba.",
    },
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">FAQ - Konseling dan Kesehatan Mental</h1>
        <p className="text-center text-gray-600 mb-8">
          Kesehatan mental adalah fondasi kehidupan yang sehat dan bahagia. Kami hadir untuk membantu menjawab pertanyaan Anda dan
          memberikan pemahaman lebih baik tentang pentingnya kesehatan mental. Jangan ragu untuk mengeksplorasi jawaban kami di
          bawah ini.
        </p>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-100 shadow-md rounded-md p-4 cursor-pointer" onClick={() => toggleAnswer(index)}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">{faq.question}</h2>
                <BiChevronDown
                  className={`text-2xl transform transition-transform ${activeIndex === index ? "rotate-180" : ""}`}
                />
              </div>
              {activeIndex === index && <p className="text-gray-600 mt-2">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;

import React from "react";

const ReasonsSection = () => {
  const reasons = [
    { id: "01", title: "Kerahasiaan Terjamin", description: "Kami memprioritaskan privasi dan kerahasiaan klien. Setiap sesi dan informasi yang Anda bagikan akan dijaga secara aman dan rahasia." },
    { id: "02", title: "Komitmen Jangka Panjang Untuk Kesehatan Mental Anda", description: "Kami memprioritaskan privasi dan kerahasiaan klien. Setiap sesi dan informasi yang Anda bagikan akan dijaga secara aman dan rahasia." },
    { id: "03", title: "Dukungan Yang Responsif", description: "Tim kami siap membantu menjawab pertanyaan atau memberikan dukungan kapan pun Anda membutuhkan, baik sebelum, selama, maupun setelah sesi konseling." },
  ];

  return (
    <div className="space-y-6">
      {reasons.map((reason) => (
        <div key={reason.id} className="flex items-start gap-4">
          <div className="flex items-center justify-center p-1 border-2 border-[#2A87CE] text-[#2A87CE] font-bold rounded-lg">{reason.id}</div>
          <div>
            <h4 className="text-lg font-semibold mb-2">{reason.title}</h4>
            <p className="text-gray-700 text-justify lg:text-left lg:pr-0 pr-4 border-b border-gray-200 py-1">{reason.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReasonsSection;

import React from "react";

const RiwayatTabel = () => {
  const riwayatData = [
    { no: 1, title: "Article 1", doctor: "Dr. John", date: "2024-11-01" },
    { no: 2, title: "Article 2", doctor: "Dr. Smith", date: "2024-11-02" },
    { no: 3, title: "Article 3", doctor: "Dr. Emily", date: "2024-11-03" },
    { no: 4, title: "Article 4", doctor: "Dr. Michael", date: "2024-11-04" },
    { no: 5, title: "Article 5", doctor: "Dr. Sarah", date: "2024-11-05" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-[#EBF6FF]">
          <tr>
            <th className="px-4 py-2 font-medium text-left border-y border-gray-200">No</th>
            <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Judul Konsultasi</th>
            <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Doktor</th>
            <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {riwayatData.map((item) => (
            <tr key={item.no}>
              <td className="px-4 py-2 border-b border-gray-200">{item.no}</td>
              <td className="px-4 py-2 border-b border-gray-200">{item.title}</td>
              <td className="px-4 py-2 border-b border-gray-200">{item.doctor}</td>
              <td className="px-4 py-2 border-b border-gray-200">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiwayatTabel;

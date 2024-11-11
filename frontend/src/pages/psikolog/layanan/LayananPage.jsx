import React from "react";

const LayananPage = () => {
  return (
    <div className="pt-16 lg:pt-5 ">
      {/* Judul dengan Border Bawah */}
      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">Layanan Saya</h1>

      {/* Tabel Layanan */}
      <div className="overflow-x-auto  border-2 shadow-xl border-gray-300 rounded-lg">
        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#EBF6FF]">
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">Service</th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">Status</th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">Consultation</td>
              <td className="py-2 px-4 border-b border-gray-200">Active</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-09</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">Therapy Session</td>
              <td className="py-2 px-4 border-b border-gray-200">Inactive</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-10</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">Group Session</td>
              <td className="py-2 px-4 border-b border-gray-200">Active</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LayananPage;

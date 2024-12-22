import React, { useEffect, useState } from "react";
import { getNotifications } from "../../../utils/api";

const LayananPage = () => {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { error, message, notifications: consulData } = await getNotifications();
        if (error) {
          throw new Error(message);
        }
        setConsultations(consulData);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchNotifications();
  }, []);

  console.log(consultations);
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
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">NO</th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">USER</th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">EMAIL</th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((data, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200">{data.user.fullname}</td>
                <td className="py-2 px-4 border-b border-gray-200">{data.user.email}</td>
                {data.status === "pending" && (
                  <td className="py-2 px-4 border-b border-gray-200 text-orange-500">{data.status}</td>
                )}
                {data.status === "accepted" && (
                  <td className="py-2 px-4 border-b border-gray-200 text-green-500">{data.status}</td>
                )}
                {data.status === "rejected" && <td className="py-2 px-4 border-b border-gray-200 text-red-500">{data.status}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LayananPage;

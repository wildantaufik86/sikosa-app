import React, { useEffect, useState } from "react";
import { getNotifications } from "../../../utils/api";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const LayananPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { error, message, notifications: consulData } = await getNotifications();
        if (error) {
          throw new Error(message);
        }
        setConsultations(consulData);
        setFilteredData(consulData);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchNotifications();
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
            {currentData.map((data, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200">{indexOfFirstItem + index + 1}</td>
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

      {/* pagination */}
      <div className="border border-[#2B79D3] rounded-full mt-6 mx-auto w-max">
        <div className="flex justify-center space-x-2 p-1">
          <button className="px-3 py-1" onClick={() => paginate(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
            <IoIosArrowBack className="text-[#2B79D3]" />
          </button>
          {[...Array(totalPages).keys()].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 ${currentPage === index + 1 ? "bg-[#2B79D3] rounded-full text-white" : "border-gray-400"}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="px-3 py-1"
            onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <IoIosArrowForward className="text-[#2B79D3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayananPage;

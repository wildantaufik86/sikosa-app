import React, { useState } from "react";
import { FiSearch } from "react-icons/fi"; // Importing React Icons
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"; // Importing arrow icons

const UserAdmin = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 10; // Number of items per page

  // Sample data for the table
  const data = [
    { no: 1, nim: "123456", nama: "John Doe", role: "Admin" },
    { no: 2, nim: "654321", nama: "Jane Smith", role: "User" },
    { no: 3, nim: "987654", nama: "Alice Brown", role: "User" },
    { no: 4, nim: "192837", nama: "Bob Green", role: "Admin" },
    { no: 5, nim: "564738", nama: "Charlie White", role: "User" },
    { no: 6, nim: "102938", nama: "David Black", role: "Admin" },
    { no: 7, nim: "203948", nama: "Eva Blue", role: "User" },
    { no: 8, nim: "304950", nama: "Frank Red", role: "Admin" },
    { no: 9, nim: "405061", nama: "Grace Yellow", role: "User" },
    { no: 10, nim: "506172", nama: "Hannah Purple", role: "Admin" },
    { no: 11, nim: "506172", nama: "Hannah Purple", role: "Psikolog" },
    // Add more data if needed
  ];

  // Filtered data based on the search query
  const filteredData = data.filter(
    (item) =>
      item.nim.includes(searchQuery) ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Paginate the filtered data
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get the current page's data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pt-16 lg:pt-5">
      {/* Search Input with Icon */}
      <div className="mb-4 max-w-xs">
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 pl-10 border border-gray-500 rounded-lg text-sm"
            placeholder="Search "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Search Icon */}
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Title with Bottom Border */}
      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">
        User
      </h1>

      {/* Table */}
      <div className="overflow-x-auto border-2 shadow-xl border-gray-300 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-[#EBF6FF]">
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
                No
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
                NIM
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
                Nama
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
                Role
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.no}>
                <td className="py-2 px-4 border-b border-gray-200">
                  {item.no}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {item.nim}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {item.nama}
                </td>
                <td className="py-2 px-4 border-b text-center border-gray-200">
                  <span className="bg-[#35A7FF] text-white px-3 py-1 text-sm rounded-full">
                    {item.role}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center border-gray-200">
                  <button className="px-3 py-1 text-sm font-semibold bg-yellow-400 text-white rounded-lg hover:bg-blue-600">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 ml-2">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination with Outer Border and Centered */}
      <div className="border border-[#2B79D3] rounded-full mt-6 mx-auto w-max">
        <div className="flex justify-center space-x-2 p-1">
          {/* Left Arrow Button */}
          <button
            className="px-3 py-1"
            onClick={() => paginate(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <IoIosArrowBack className="text-[#2B79D3]" />
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages).keys()].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 ${
                currentPage === index + 1
                  ? "bg-[#2B79D3] rounded-full text-white"
                  : "border-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}

          {/* Right Arrow Button */}
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

export default UserAdmin;

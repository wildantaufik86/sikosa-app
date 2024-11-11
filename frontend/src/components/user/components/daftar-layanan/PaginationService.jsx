import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ServicePagination = ({ currentPage, totalPages, prevPage, nextPage, paginate }) => (
  <div className="flex justify-center items-center mt-6">
    <nav className="border border-gray-300 rounded-full flex items-center space-x-3 py-1 px-3">
      {/* Previous Button */}
      <button onClick={prevPage} className={`p-2 rounded-full ${currentPage === 1 ? "bg-gray-200 text-gray-400" : "bg-white text-blue-500 hover:bg-blue-100"}`} disabled={currentPage === 1}>
        <FaChevronLeft />
      </button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => (
        <button key={index} onClick={() => paginate(index + 1)} className={`px-4 py-2 rounded-full ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-white text-blue-500 hover:bg-blue-100"}`}>
          {index + 1}
        </button>
      ))}

      {/* Next Button */}
      <button onClick={nextPage} className={`p-2 rounded-full ${currentPage === totalPages ? "bg-gray-200 text-gray-400" : "bg-white text-blue-500 hover:bg-blue-100"}`} disabled={currentPage === totalPages}>
        <FaChevronRight />
      </button>
    </nav>
  </div>
);

export default ServicePagination;

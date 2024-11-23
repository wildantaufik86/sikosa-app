import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const PaginationArtikelAdmin = ({ currentPage, totalPages, paginate }) => {
  return (
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
  );
};

export default PaginationArtikelAdmin;

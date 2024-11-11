import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const PaginationArtikel = ({ currentPage, totalPages, handlePrev, handleNext, setCurrentPage }) => {
  return (
    <div className="w-full flex justify-center items-center mt-8">
      <div className="flex justify-center items-center border border-blue-500 rounded-full py-1 px-3 bg-white">
        <button onClick={handlePrev} disabled={currentPage === 1} className="text-blue-500 text-lg disabled:opacity-50">
          <IoIosArrowBack />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 text-sm ${
              currentPage === page
                ? "bg-blue-500 text-white" // Active page
                : "hover:bg-blue-100 text-gray-700" // Inactive page
            } rounded-full`}
          >
            {page}
          </button>
        ))}

        {/* Next Arrow Button */}
        <button onClick={handleNext} disabled={currentPage === totalPages} className="text-blue-500 text-lg disabled:opacity-50">
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
};

export default PaginationArtikel;

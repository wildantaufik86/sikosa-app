import { FaChevronLeft, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const SearchRiwayat = () => {
  return (
    <div className="flex items-center justify-between space-x-4 py-2">
      {/* Back Link Button */}
      <Link to="/artikel" className="border-2 mb-3 border-black p-2 rounded-full flex items-center justify-center w-10 h-10">
        <FaChevronLeft className="text-black" />
      </Link>

      {/* Search Input with Icon Outside */}
      <div className="flex items-center border-2 mb-3 p-2 rounded-xl shadow-md w-64">
        <input type="text" placeholder="Search..." className="w-full pl-3 pr-3 border-none outline-none" />
        <FaSearch className="text-gray-500 ml-2" />
      </div>
    </div>
  );
};

export default SearchRiwayat;

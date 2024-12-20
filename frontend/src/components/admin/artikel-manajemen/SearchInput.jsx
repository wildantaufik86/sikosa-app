import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({ searchQuery, handleSearchArtikel }) => {
  return (
    <div className="relative max-w-xs">
      <input
        type="text"
        className="w-full p-2 pl-10 border border-gray-500 rounded-lg text-sm"
        placeholder="Search"
        value={searchQuery}
        onChange={handleSearchArtikel}
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

export default SearchInput;

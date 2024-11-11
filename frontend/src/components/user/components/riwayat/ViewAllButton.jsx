// ViewAllButton.js
import React from "react";
import { IoIosArrowForward } from "react-icons/io";

const ViewAllButton = () => {
  return (
    <div className="flex justify-end mb-4">
      <button className="flex items-center text-blue-400 text-sm">
        <span>View All</span>
        <IoIosArrowForward className="ml-2" />
      </button>
    </div>
  );
};

export default ViewAllButton;

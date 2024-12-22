// ViewAllButton.js
import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const ViewAllButton = () => {
  return (
    <div className="flex justify-end mb-4">
      <Link to={"/riwayat"} className="flex items-center text-blue-400 text-sm">
        <span>View All</span>
        <IoIosArrowForward className="ml-2" />
      </Link>
    </div>
  );
};

export default ViewAllButton;

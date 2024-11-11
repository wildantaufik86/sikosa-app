import React from "react";
import { FaCheckSquare } from "react-icons/fa";

const ChecklistItem = ({ text }) => {
  return (
    <div className="flex items-center mb-4">
      <FaCheckSquare className="text-[#35A7FF] mr-2" />
      <span className="text-sm lg:text-md">{text}</span>
    </div>
  );
};

export default ChecklistItem;

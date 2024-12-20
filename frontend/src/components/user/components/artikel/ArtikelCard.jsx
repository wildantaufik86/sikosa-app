import React from "react";
import { Link } from "react-router-dom";
import CONFIG from "../../../../config/config";
import { formattedDate, formattedTitle } from "../../../../utils/utils";

const ArtikelCard = ({ article }) => {
  return (
    <Link to={`/artikel/${article.slug}`} className="w-full h-[300px]">
      {" "}
      {/* Link wrapping the entire card */}
      <div className="border flex-1 flex flex-col rounded-lg shadow-md text-black bg-white p-2 h-full hover:bg-[#35A7FF] hover:text-white transition duration-300">
        <div className="flex-1 bg-white p-2 rounded-md">
          <img
            src={CONFIG.BASE_URL + article.thumbnail}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>

        <div className="px-4 py-2 flex-1 mt-4">
          <h3 className="text-sm font-semibold">{formattedTitle(article.title)}</h3>
        </div>
        <div className="flex flex-col px-4">
          <p className="text-[8px] font-light">{formattedDate(article.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ArtikelCard;

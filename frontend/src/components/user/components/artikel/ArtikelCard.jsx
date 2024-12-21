import React from "react";
import { Link } from "react-router-dom";
import CONFIG from "../../../../config/config";
import { formattedDate, formattedTitle } from "../../../../utils/utils";
import parse from "html-react-parser";

const ArtikelCard = ({ article }) => {
  return (
    <Link to={`/artikel/${article.slug}`} className="w-full h-[300px]">
      {/* Link wrapping the entire card */}
      <div className="border flex-1 flex flex-col rounded-lg shadow-md text-black bg-white hover:bg-[#35A7FF] hover:text-white transition duration-300 overflow-hidden">
        {/* Gambar menempel ke card */}
        <div className="flex-1">
          <img
            src={CONFIG.BASE_URL + article.thumbnail}
            className="w-full h-48 object-cover"
            alt={article.title}
          />
        </div>

        <div className="px-4 py-2 flex-1 mt-4">
          <h3 className="text-sm font-semibold line-clamp-2">{article.title}</h3>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="text-sm font-normal line-clamp-2">{parse(article.content)}</div>
        </div>
        <div className="flex flex-col px-4 py-2">
          <p className="text-[8px] font-light">{formattedDate(article.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ArtikelCard;

import React from "react";
import { Link } from "react-router-dom";

const ArtikelCard = ({ article }) => {
  return (
    <Link to={`/artikel/1`} className="block">
      {" "}
      {/* Link wrapping the entire card */}
      <div className="border rounded-lg shadow-md bg-white hover:bg-[#35A7FF] transition duration-300">
        <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-t-md" />
        <div className="px-4 py-2">
          <h3 className="text-lg font-bold text-black">{article.title}</h3>
          <p className="text-gray-600 text-sm mt-1 text-justify">{article.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ArtikelCard;

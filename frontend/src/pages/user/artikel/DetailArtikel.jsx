import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const ArtikelDetail = () => {
  return (
    <div className="py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-700 flex items-center space-x-2">
        <Link to="/" className="hover:text-blue-500">
          Beranda
        </Link>{" "}
        <span>&gt;</span>
        <Link to="/artikel" className="hover:text-blue-500">
          Artikel
        </Link>{" "}
        <span>&gt;</span>
        <span className="font-semibold">hehe</span>
      </div>

      <Link to="/artikel" className="border-2 mb-3 border-black p-2 rounded-full flex items-center justify-center w-10 h-10">
        <FaChevronLeft className="text-black" />
      </Link>

      <div className="max-w-3xl mx-auto my-10 p-6 border border-gray-300 rounded-lg shadow-lg">
        {/* Article Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center">Artikel Title</h2>

        {/* Article Image */}
        <div className="w-full h-64 overflow-hidden rounded-lg mb-4">
          <img
            src="/assets/article-image.jpg" // Replace with your image path
            alt="Artikel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Description */}
        <p className="text-lg text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Fusce ut massa vitae justo bibendum convallis. Maecenas non eros id erat volutpat varius.
          Duis ac feugiat risus. Etiam at dolor eget urna aliquam auctor in non leo.
        </p>
      </div>
    </div>
  );
};

export default ArtikelDetail;

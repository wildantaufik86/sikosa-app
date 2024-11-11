import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = () => (
  <div className="mb-4 text-sm text-gray-700">
    <Link to="/" className="hover:text-blue-500 mr-1">
      Beranda
    </Link>
    {" > "}
    <span className="font-semibold ml-1">Daftar Layanan</span>
  </div>
);

export default Breadcrumb;

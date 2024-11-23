import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchInput from "../../../components/admin/artikel-manajemen/SearchInput";
import TableArtikel from "../../../components/admin/artikel-manajemen/TabelArtikel";
import PaginationArtikelAdmin from "../../../components/admin/artikel-manajemen/PaginationArtikelAdmin";

const ArtikelManajemen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const data = [
    {
      no: 1,
      image: "/assets/caroulsel1.png",
      title: "Manajemen Keuangan",
      slug: "manajemen-keuangan",
      description: "An article about financial management strategies.",
    },
    {
      no: 2,
      image: "path_to_image_2.jpg",
      title: "Sumber Daya Manusia",
      slug: "sumber-daya-manusia",
      description: "An article about human resource management.",
    },
  ];

  const filteredData = data.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <section className="pt-16 lg:pt-5">
      <header className="mb-4 flex justify-between items-center">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </header>

      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">
        Artikel Manajemen
      </h1>

      <div className="mb-5">
        <Link
          to="/admin/artikel-manajemen/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Tambah Artikel
        </Link>
      </div>

      <TableArtikel
        data={filteredData}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      <PaginationArtikelAdmin
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </section>
  );
};

export default ArtikelManajemen;

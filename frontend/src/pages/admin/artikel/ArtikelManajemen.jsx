import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchInput from "../../../components/admin/artikel-manajemen/SearchInput";
import TableArtikel from "../../../components/admin/artikel-manajemen/TabelArtikel";
import PaginationArtikelAdmin from "../../../components/admin/artikel-manajemen/PaginationArtikelAdmin";
import { AdminGetArticles } from "../../../utils/api";

const ArtikelManajemen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [articles, setArticles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await AdminGetArticles();
        if (response.error) {
          throw new Error(response.message);
        }
        setArticles(response.articles);
        setFilteredData(response.articles);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchArticles();
  }, []);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getCurrendArticles = (selectedArticle) => {
    setFilteredData(articles.filter((article) => article._id !== selectedArticle));
  };

  const handleSearchArtikel = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      setFilteredData(articles.filter((article) => article.title.toLowerCase().includes(query)));
    } else {
      setFilteredData(articles);
    }
  };

  return (
    <section className="pt-16 lg:pt-5">
      <header className="mb-4 flex justify-between items-center">
        <SearchInput searchQuery={searchQuery} handleSearchArtikel={handleSearchArtikel} />
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
        getCurrendArticles={getCurrendArticles}
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

import React, { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { getArticleBySlug } from "../../../utils/api";
import ArticleContent from "../../../components/user/components/artikel/ArticleContent";

const ArtikelDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await getArticleBySlug(slug);
        if (response.error) {
          throw new Error(response.message);
        }

        setArticle(response.article);
      } catch (error) {}
    };
    fetchArticle();
  }, []);

  if (!article) {
    return null;
  }

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
        <span className="font-semibold">{slug}</span>
      </div>

      <Link
        to="/artikel"
        className="border-2 mb-3 border-black p-2 rounded-full flex items-center justify-center w-10 h-10"
      >
        <FaChevronLeft className="text-black" />
      </Link>

      {/* article section */}
      <ArticleContent article={article} />
    </div>
  );
};

export default ArtikelDetail;

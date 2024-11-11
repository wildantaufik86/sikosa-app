import React, { useState } from "react";
import { motion } from "framer-motion";
import ArtikelCard from "../../../components/user/components/artikel/ArtikelCard";
import KategoriArtikel from "../../../components/user/components/artikel/KategoriArtikel";
import PaginationArtikel from "../../../components/user/components/artikel/PaginationArtikel";

const ArtikelPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 4;

  // Dummy article data
  const articles = [
    { title: "Article 1", description: "Description 1", image: "https://via.placeholder.com/150" },
    { title: "Article 2", description: "Description 2", image: "https://via.placeholder.com/150" },
    { title: "Article 3", description: "Description 3", image: "https://via.placeholder.com/150" },
    { title: "Article 4", description: "Description 4", image: "https://via.placeholder.com/150" },
    { title: "Article 5", description: "Description 5", image: "https://via.placeholder.com/150" },
    { title: "Article 6", description: "Description 6", image: "https://via.placeholder.com/150" },
    { title: "Article 7", description: "Description 7", image: "https://via.placeholder.com/150" },
    { title: "Article 8", description: "Description 8", image: "https://via.placeholder.com/150" },
  ];

  const filteredArticles = selectedCategory === "Terbaru" ? articles.slice(0, 4) : articles;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="container mx-auto py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      {/* Title and Category Tabs */}
      <KategoriArtikel selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      {/* Animated Article Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible" whileInView="visible" viewport={{ once: false }}>
        {currentArticles.map((article, index) => (
          <motion.div key={index} variants={itemVariants}>
            <ArtikelCard article={article} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && <PaginationArtikel currentPage={currentPage} totalPages={totalPages} handlePrev={handlePrev} handleNext={handleNext} setCurrentPage={setCurrentPage} />}
    </div>
  );
};

export default ArtikelPage;

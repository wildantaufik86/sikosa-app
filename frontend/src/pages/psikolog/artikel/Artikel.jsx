import { useState } from "react";
import {
  FiPlus,
  FiSettings,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const ArtikelPage = () => {
  const [isManageMode, setIsManageMode] = useState(false); // To toggle manage mode
  const [selectedArticles, setSelectedArticles] = useState([]); // To keep track of selected articles

  // Function to toggle article selection
  const handleSelectArticle = (id) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(
        selectedArticles.filter((articleId) => articleId !== id)
      );
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  return (
    <div className="pt-16 lg:pt-0 lg:px-4">
      {/* Search Input with Icon */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search articles..."
          className="w-1/2 p-2 pl-10 border border-gray-500 rounded-lg focus:outline-none focus:border-[#35A7FF] text-gray-700"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
      </div>

      {/* Button Row */}
      <div className="flex justify-between items-center mb-6">
        {/* New Post Button */}
        <Link
          to="/psikolog/artikel/add"
          className="flex items-center px-4 py-2 bg-[#35A7FF] text-white font-medium text-sm rounded-lg"
        >
          <FiPlus className="mr-2" />
          New Post
        </Link>

        {/* Manage Button with Delete Icon */}
        <div className="flex items-center space-x-4">
          {isManageMode && selectedArticles.length > 0 && (
            <button className="ml-4 text-black text-2xl">
              <FiTrash2 className="inline-block" />
            </button>
          )}

          <button
            className="flex items-center px-4 py-2 font-medium text-sm bg-[#35A7FF] text-white rounded-lg"
            onClick={() => setIsManageMode(!isManageMode)}
          >
            <FiSettings className="mr-2" />
            Manage
          </button>
        </div>
      </div>

      {/* Artikel Cards */}
      <div>
        {/* Article Card 1 */}
        <div className="p-2 mb-4 bg-white border border-gray-400 rounded-lg flex items-center">
          {isManageMode && (
            <input
              type="checkbox"
              checked={selectedArticles.includes(1)}
              onChange={() => handleSelectArticle(1)}
              className="mr-4"
            />
          )}
          <img
            src="/assets/caroulsel1.png"
            alt="Article 1"
            className="w-16 h-16 object-cover mr-4"
          />
          <div className="space-y-2 w-full">
            <h3 className="text-md font-normal">Article Title 1</h3>
            <div className="flex justify-between">
              <p className="text-gray-600 text-sm flex justify-between items-center">
                Brief description of the article content goes here...
              </p>
              {/* Add Eye and Edit icons */}
              <div className="space-x-2 mr-2">
                <Link to="" className="text-gray-500 hover:text-[#35A7FF]">
                  <FiEye className="inline-block mr-2" />
                </Link>
                <Link
                  to="/psikolog/artikel/edit/1"
                  className="text-gray-500 hover:text-[#35A7FF]"
                >
                  <FiEdit className="inline-block" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Add more article cards similarly */}
      </div>
    </div>
  );
};

export default ArtikelPage;

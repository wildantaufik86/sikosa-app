import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSettings,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { deleteArticle, getArticlesByWriter } from "../../../utils/api";
import CONFIG from "../../../config/config";
import { useAuth } from "../../../hooks/hooks";
import { toast } from "react-toastify";

const ArtikelPage = () => {
  const { authUser } = useAuth();
  const [isManageMode, setIsManageMode] = useState(false); // To toggle manage mode
  const [selectedArticles, setSelectedArticles] = useState([]); // To keep track of selected articles
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticlesByWriter(authUser._id);
        if (response.error) {
          throw new Error(response.message);
        }
        setArticles(response.articles);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchArticles();
  }, []);

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

  const handleDeleteArticle = async () => {
    try {
      const deletePromise = selectedArticles.map(async (article) => {
        const response = await deleteArticle(article);
        if (response.error) {
          throw new Error(response.message);
        }

        return article;
      });

      const deletedArticlesId = await Promise.all(deletePromise);

      setArticles(
        articles.filter((article) => !deletedArticlesId.includes(article._id))
      );
      setSelectedArticles([]);
      toast.success("Article successfully deleted ");
    } catch (error) {
      toast.error(error.message);
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
            <button
              onClick={handleDeleteArticle}
              className="ml-4 text-black text-2xl"
            >
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
        {articles.length !== 0 ? (
          articles.map((data, index) => (
            <ArticleCard
              key={index}
              isManageMode={isManageMode}
              handleSelectArticle={handleSelectArticle}
              selectedArticles={selectedArticles}
              articleData={data}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <p>Tidak ada artikel</p>
          </div>
        )}

        {/* Add more article cards similarly */}
      </div>
    </div>
  );
};

const ArticleCard = ({
  isManageMode,
  handleSelectArticle,
  selectedArticles,
  articleData,
}) => {
  return (
    <div className="p-2 mb-4 bg-white border border-gray-400 rounded-lg flex items-center">
      {isManageMode && (
        <input
          type="checkbox"
          checked={selectedArticles.includes(articleData._id)}
          onChange={() => handleSelectArticle(articleData._id)}
          className="mr-4"
        />
      )}
      <img
        src={CONFIG.BASE_URL + articleData.thumbnail}
        alt="Article 1"
        className="w-16 h-16 object-cover mr-4"
      />
      <div className="space-y-2 w-full">
        <h3 className="text-md font-normal">{articleData.title}</h3>
        <div className="flex justify-between">
          {/* Add Eye and Edit icons */}
          <div className="space-x-2 mr-2">
            <Link
              to={`/psikolog/artikel/${articleData.slug}`}
              className="text-gray-500 hover:text-[#35A7FF]"
            >
              <FiEye className="inline-block mr-2" />
            </Link>
            <Link
              to={`/psikolog/artikel/edit/${articleData.slug}`}
              className="text-gray-500 hover:text-[#35A7FF]"
            >
              <FiEdit className="inline-block" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtikelPage;

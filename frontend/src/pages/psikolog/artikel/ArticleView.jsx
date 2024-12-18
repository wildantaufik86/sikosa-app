import { Link, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import parse from "html-react-parser";
import { formattedDate } from "../../../utils/utils";
import { useEffect, useState } from "react";
import { getArticleBySlug } from "../../../utils/api";
import CONFIG from "../../../config/config";

const ArtikelView = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await getArticleBySlug(slug);
        if (response.error) {
          throw new Error(response.message);
        }

        setTitle(response.article.title);
        setContent(response.article.content);
        setThumbnail(response.article.thumbnail);
        setCreatedAt(response.article.createdAt);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchArticle();
  }, []);

  if (!title) {
    return null;
  }

  return (
    <>
      <div className="pt-12 md:py-0">
        <Link to="/psikolog/artikel">
          <div className="mb-6 flex items-center space-x-2">
            <div className="border-2 border-black rounded-full p-1">
              <IoIosArrowBack className="text-black text-xl" />
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4 mt-10 lg:mt-10 bg-white border shadow-md">
        {/* Header with Logo and App Name */}
        <div className="flex items-center mb-6">
          <img
            src="/assets/nav-logo.png"
            alt="App Logo"
            className="w-7 h-7 mr-2"
          />
          <h1 className="text-xl font-bold text-[#35A7FF]">Sikosa</h1>
        </div>

        {/* Article Content */}
        <div className="space-y-4 lg:flex flex-col lg:flex-row justify-between items-center mb-6">
          {/* Left: Article Title and Publish Date */}
          <div className="flex-1 mb-4 lg:mb-0">
            <h2 className="text-2xl font-semibold mb-5">{title}</h2>
            <p className="text-gray-600">{formattedDate(createdAt)}</p>
          </div>

          {/* Right: Article Thumbnail */}
          <div className="flex-1 justify-center items-center flex">
            <img
              src={CONFIG.BASE_URL + thumbnail}
              alt="Thumbnail"
              className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-72 object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="space-y-4 max-w-md text-justify flex flex-col justify-center mx-auto">
          {parse(content)}
        </div>
      </div>
    </>
  );
};

export default ArtikelView;

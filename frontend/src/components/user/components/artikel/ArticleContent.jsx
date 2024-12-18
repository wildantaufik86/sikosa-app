import { useEffect, useState } from "react";
import CONFIG from "../../../../config/config";
import { formattedDate } from "../../../../utils/utils";
import parse from "html-react-parser";
import { getPsikologById } from "../../../../utils/api";

const ArticleContent = ({ article }) => {
  const [psikolog, setPsikolog] = useState(null);

  useEffect(() => {
    const fetchPsikolog = async () => {
      try {
        const response = await getPsikologById(article.writer_id);
        if (response.error) {
          return false;
        }

        setPsikolog(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPsikolog();
  }, []);
  return (
    <div className="p-4 mt-10 lg:mt-10 bg-white border shadow-md">
      {/* Header with Logo and App Name */}
      <div className="flex items-center p-2 mb-6">
        <img
          src="/assets/nav-logo.png"
          alt="App Logo"
          className="w-7 h-7 mr-2"
        />
        <h1 className="text-xl font-bold text-[#35A7FF]">Sikosa</h1>
      </div>

      {/* Article header */}
      <div className="space-y-4 p-4 lg:flex flex-col lg:flex-row justify-between items-center mb-6">
        {/* Left: Article Title and Publish Date */}
        <div className="flex-1 mb-4 md:pl-8 lg:mb-0">
          <h2 className="text-2xl font-semibold mb-5">{article.title}</h2>
          <p className="text-[#35A7FF]">{formattedDate(article.createdAt)}</p>
          <p className="text-xs font-semibold ">
            {psikolog?.profile.fullname || "Admin"}
          </p>
        </div>

        {/* Right: Article Thumbnail */}
        <div className="flex-1 justify-center items-center flex">
          <img
            src={CONFIG.BASE_URL + article.thumbnail}
            alt="Thumbnail"
            className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-72 object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="space-y-4 max-w-md text-justify flex flex-col justify-center mx-auto">
        {parse(article.content)}
      </div>
    </div>
  );
};

export default ArticleContent;

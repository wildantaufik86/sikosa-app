import React, { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { useAuth } from "../../hooks/hooks";
import { getArticles } from "../../utils/api";
import CONFIG from "../../config/config";
import { formattedDate, formattedTitle } from "../../utils/utils";

const Beranda = () => {
  const { authUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [viewAll, setViewAll] = useState(3);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticles();
        if (response.error) {
          throw new Error(response.message);
        }
        const filteredArticleByWriter = response.articles.filter(
          (article) => article.writer === authUser._id
        );
        setArticles(filteredArticleByWriter);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="pt-16 lg:mt-10 lg:py-0 font-jakarta">
      {/* Main Title */}
      <div className="mb-3 ml-0 lg:ml-5">
        <h1 className="text-2xl font-bold mb-3">
          Selamat Datang {authUser.profile.fullname}
        </h1>
        <p className="text-lg">
          Selamat beraktivitas, semoga harmu menyenangkan!
        </p>
      </div>

      {/* Layanan Saya Section */}
      <div className="mb-6 border py-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold px-4">Layanan Saya</h2>
          <button className="flex items-center text-sm text-[#35A7FF] font-semibold">
            View All
            <IoIosArrowForward className="ml-1" />
          </button>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#EBF6FF]">
              <th className="py-2 px-4 border-b text-m font-normal text-left border-gray-200">
                Service
              </th>
              <th className="py-2 px-4 border-b text-m font-normal text-left border-gray-200">
                Status
              </th>
              <th className="py-2 px-4 border-b text-m font-normal text-left border-gray-200">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">
                Consultation
              </td>
              <td className="py-2 px-4 border-b border-gray-200">Active</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-09</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">
                Therapy Session
              </td>
              <td className="py-2 px-4 border-b border-gray-200">Inactive</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-10</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200">
                Group Session
              </td>
              <td className="py-2 px-4 border-b border-gray-200">Active</td>
              <td className="py-2 px-4 border-b border-gray-200">2024-11-12</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Artikel Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Artikel Saya</h2>
          <button
            onClick={() =>
              setViewAll((prevViewAll) =>
                prevViewAll === articles.length ? 3 : articles.length
              )
            }
            className="flex items-center text-sm text-[#35A7FF] font-semibold"
          >
            {viewAll === articles.length ? "View less" : "View All"}
            <IoIosArrowForward className="ml-1" />
          </button>
        </div>

        <div>
          {/* Placeholder for Artikel Cards */}
          {articles.slice(0, viewAll).map((article, index) => {
            return (
              <div
                key={index}
                className=" p-2 mb-4 bg-white border border-gray-400 rounded-lg flex items-center"
              >
                <img
                  src={CONFIG.BASE_URL + article.thumbnail}
                  alt={article.title}
                  className="w-16 h-16 object-cover mr-4"
                />
                <div className="space-y-2">
                  <h3 className="text-md font-normal">
                    {formattedTitle(article.title)}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {formattedDate(article.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Beranda;

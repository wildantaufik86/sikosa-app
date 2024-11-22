import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const PreviewArtikel = () => {
  const articleTitle =
    "John Lewis to make final journey across Edmund Pettus Bridge in procession"; // Example title, replace with dynamic data if needed
  const publishDate = "November 13, 2024"; // Example date, replace with dynamic data if needed
  const thumbnailUrl = "path-to-thumbnail.jpg"; // Replace with dynamic thumbnail data
  const descriptionText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque interdum erat vitae metus euismod, non cursus ex auctor.`;

  return (
    <>
      <div>
        <Link to="/psikolog/artikel/add">
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
            <h2 className="text-2xl font-semibold mb-5">{articleTitle}</h2>
            <p className="text-gray-600">{publishDate}</p>
          </div>

          {/* Right: Article Thumbnail */}
          <div className="flex-1 justify-center items-center flex">
            <img
              src="/assets/caroulsel2.png"
              alt="Thumbnail"
              className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-72 object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="space-y-4 max-w-md text-justify flex flex-col justify-center items-center mx-auto">
          {/* Three Paragraphs of Description */}
          <p>{descriptionText}</p>
          <p>{descriptionText}</p>
          <p>{descriptionText}</p>

          {/* Additional Thumbnail Image (same size and square, responsive) */}
          <div className="my-6 flex justify-center">
            <img
              src="/assets/caroulsel2.png"
              alt="Thumbnail"
              className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-72 object-cover"
            />
          </div>

          {/* Two More Paragraphs of Description */}
          <p>{descriptionText}</p>
          <p>{descriptionText}</p>
        </div>
      </div>
    </>
  );
};

export default PreviewArtikel;

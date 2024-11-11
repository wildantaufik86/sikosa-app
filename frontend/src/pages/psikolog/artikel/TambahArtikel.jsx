import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";

const TambahArtikel = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="pt-16 lg:pt-10 lg:px-4">
      {/* Title Section */}
      <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h2 className="text-xl font-semibold">New Artikel</h2>
        <div className="space-x-2">
          <Link to="/psikolog/artikel" className="px-4 py-1 bg-[#35A7FF] text-sm text-white rounded-lg">
            Cancel
          </Link>
          <button className="px-4 py-1 bg-[#35A7FF] text-sm text-white rounded-lg">Post</button>
        </div>
      </div>

      {/* Back Arrow Icon with Border Circle */}
      <Link to="/psikolog/artikel">
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </Link>

      {/* Image Upload Section */}
      <div className="flex mb-6">
        <div className="mr-6 flex flex-col items-center w-32 h-24">
          {image ? (
            <img
              src={image}
              alt="Selected"
              className="w-full h-full object-cover border rounded-lg" // Image fills the square container
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex justify-center items-center border rounded-lg">
              <span className="text-gray-500 text-center">No image selected</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col justify-center">
          <span className="text-xs text-left text-black mb-2">Please upload square image, size less than 100KB</span>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-400 rounded-lg" // Full width for Choose Image button
          />
        </div>
      </div>

      {/* Title Input Section */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full p-3 border border-gray-400 rounded-lg" placeholder="Enter article title" />
      </div>

      {/* Description Input Section */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="mt-2 w-full p-3 border border-gray-400 rounded-lg" placeholder="Enter article description" />
      </div>
    </div>
  );
};

export default TambahArtikel;

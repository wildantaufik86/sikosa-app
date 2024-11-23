import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { AiFillStar } from "react-icons/ai"; // Import the star icon

const AddArtikelAdmin = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(
      newTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
    );
  };

  return (
    <div className="pt-16 pb-10 lg:pt-10 lg:px-4 font-jakarta">
      {/* Title Section */}
      <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h2 className="text-xl font-semibold">New Artikel</h2>
        <div className="space-x-2">
          <Link
            to="/admin/artikel-manajemen"
            className="px-4 py-[5px] bg-[#35A7FF] text-sm text-white rounded-lg"
          >
            Cancel
          </Link>
          <button className="px-4 py-1 bg-[#35A7FF] text-sm text-white rounded-lg">
            Post
          </button>
        </div>
      </div>

      {/* Back Arrow Icon with Border Circle */}
      <Link to="/admin/artikel-manajemen">
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </Link>

      {/* Image Upload Section with Thumbnail Label */}
      <div className="mb-6">
        <label className="flex items-center mb-2">
          <AiFillStar className="text-[10px] text-red-500 mr-2" />{" "}
          {/* Red star icon */}
          <span className="text-sm font-medium text-gray-700">
            Thumbnail Image
          </span>
        </label>
        <div className="flex">
          <div className="mr-6 flex flex-col items-center w-32 h-24">
            {image ? (
              <img
                src={image}
                alt="Selected"
                className="w-full h-full object-cover border rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex justify-center items-center border rounded-lg">
                <span className="text-gray-500 text-center">
                  No image selected
                </span>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col justify-center">
            <span className="text-xs text-left text-black mb-2">
              Please upload square image, size less than 100KB
            </span>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-400 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Title Input Section */}
      <div className="mb-4">
        <label
          htmlFor="title"
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />{" "}
          {/* Red star icon */}
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          className="mt-2 w-full p-3 border border-gray-400 rounded-lg"
          placeholder="Enter article title"
        />
      </div>

      {/* Slug Input Section */}
      <div className="mb-6">
        <label
          htmlFor="slug"
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />{" "}
          {/* Red star icon */}
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 w-full p-3 border border-gray-400 rounded-lg"
          placeholder="Enter article slug"
        />
      </div>

      {/* Description Input Section with CKEditor */}
      <div className="mb-6">
        <label
          htmlFor="description"
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />{" "}
          {/* Red star icon */}
          Description
        </label>
        <div className="ckeditor-container pt-3">
          <CKEditor
            editor={ClassicEditor}
            data={description}
            onChange={(event, editor) => setDescription(editor.getData())}
            config={{
              placeholder: "Enter article description",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddArtikelAdmin;

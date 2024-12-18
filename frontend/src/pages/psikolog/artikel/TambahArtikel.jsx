import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { AiFillStar } from "react-icons/ai"; // Import the star icon
import { createArticle } from "../../../utils/api";

const TambahArtikel = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load data from sessionStorage if available
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("artikelData"));
    if (location.state) {
      // restore file thumbnail when change page
      const { thumbnailFile } = location.state;
      setThumbnail(thumbnailFile);
    }
    if (savedData) {
      setTitle(savedData.title);
      setSlug(savedData.slug);
      setContent(savedData.content);
      setImage(savedData.image);
    }
  }, []);

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    // Pastikan data yang akan disimpan tidak kosong atau null
    if (title && content && image !== null) {
      const artikelData = { title, slug, content, image };
      sessionStorage.setItem("artikelData", JSON.stringify(artikelData));
    }
  }, [title, slug, content, image, thumbnail]);

  const handlePreview = () => {
    if (!title || !content || !image) {
      alert("please fill the required input");
      return false;
    }

    navigate(`/psikolog/artikel/preview/${slug}`, {
      state: { title, content, image, thumbnail },
    });
  };

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnail(file);
      setImage(URL.createObjectURL(file));
    }
  };

  // Handle title change and automatically generate slug
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

  const handlePostArticle = async (e) => {
    e.preventDefault();
    if (!title || !thumbnail || !content) {
      alert("Please fill the required input");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("thumbnail", thumbnail);
      formData.append("content", content);

      const response = await createArticle(formData);
      if (response.error) {
        throw new Error(response.message);
      }
      alert(response.message);
      sessionStorage.removeItem("artikelData");
      navigate("/psikolog/artikel");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelPost = () => {
    sessionStorage.removeItem("artikelData");
    navigate("/psikolog/artikel");
  };

  return (
    <form
      onSubmit={handlePostArticle}
      className="pt-16 pb-10 lg:pt-10 lg:px-4 font-jakarta"
    >
      {/* Title Section */}
      <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h2 className="text-xl font-semibold">New Artikel</h2>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-1 text-sm text-black border border-black rounded-lg"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleCancelPost}
            className="px-4 py-[5px] bg-[#35A7FF] text-sm text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1 bg-[#35A7FF] text-sm text-white rounded-lg"
          >
            Post
          </button>
        </div>
      </div>

      {/* Back Arrow Icon with Border Circle */}
      <button type="button" onClick={handleCancelPost}>
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </button>

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
          required
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
          className="outline-none opacity-50 mt-2 w-full p-3 border border-gray-400 rounded-lg"
          placeholder="Enter article slug"
          readOnly
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
          Content
        </label>
        <div className="ckeditor-container pt-3">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => setContent(editor.getData())}
            config={{
              placeholder: "Enter article description",
            }}
          />
        </div>
      </div>
    </form>
  );
};

export default TambahArtikel;

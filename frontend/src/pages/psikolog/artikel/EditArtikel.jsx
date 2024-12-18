import { IoIosArrowBack } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { editArticle, getArticleBySlug } from "../../../utils/api";
import CONFIG from "../../../config/config";

const EditArtikel = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [article, setArticle] = useState(null);
  const { slug_article } = useParams();
  const [image, setImage] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await getArticleBySlug(slug_article);
        if (response.error) {
          throw new Error(response.message);
        }
        setArticle(response.article);
        setTitle(response.article.title);
        setContent(response.article.content);
        setSlug(response.article.slug);
        setImage(CONFIG.BASE_URL + response.article.thumbnail);
        setThumbnail(response.article.thumbnail);
      } catch (error) {
        alert(error.message);
      }
    };

    fetchArticle();
  }, []);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnail(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle.replace(/[^\w\s-]/g, ""));
    setSlug(
      newTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
    );
  };

  const handleEditArticle = async (e) => {
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

      const response = await editArticle(formData, article._id);
      if (response.error) {
        throw new Error(response.message);
      }
      alert(response.message);
      navigate("/psikolog/artikel");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form
      onSubmit={handleEditArticle}
      className="pt-16 pb-10 lg:pt-10 lg:px-4 font-jakarta"
    >
      {/* Title Section */}
      <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h2 className="text-xl font-semibold">Edit Artikel</h2>
        <div className="space-x-2">
          <Link
            to="/psikolog/artikel"
            className="px-4 py-[5px] bg-[#35A7FF] text-sm text-white rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-[4px] bg-[#35A7FF] text-sm text-white rounded-lg"
          >
            Save
          </button>
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
            <img
              src={image}
              alt="Selected"
              className="w-full h-full object-cover border rounded-lg"
            />
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
      <div className="mb-6">
        <label
          htmlFor="title"
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />
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
          className="flex items-center text-sm opacity-50 font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 w-full p-3 border opacity-50 outline-none border-gray-400 rounded-lg"
          placeholder="Enter article slug"
          readOnly
        />
      </div>

      {/* Description Input Section with CKEditor */}
      <div>
        <label
          htmlFor="description"
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <AiFillStar className="text-[10px] text-red-500 mr-2" />
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

export default EditArtikel;

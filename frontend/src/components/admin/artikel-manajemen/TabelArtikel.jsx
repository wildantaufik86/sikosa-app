import React, { useState } from "react";
import { Link } from "react-router-dom";
import CONFIG from "../../../config/config";
import ModalConfirm from "../../ModalConfirm";
import { toast } from "react-toastify";
import { AdminDeleteArticle } from "../../../utils/api";

const TableArtikel = ({ data, currentPage, itemsPerPage, getCurrendArticles }) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleDeleteModal = async () => {
    try {
      const response = await AdminDeleteArticle(selectedArticle);
      if (response.error) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      setIsOpen(false);
      getCurrendArticles(selectedArticle);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="overflow-x-auto border-2 shadow-xl border-gray-300 rounded-lg mb-6">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBF6FF]">
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">No</th>
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
              Image
            </th>
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
              Title
            </th>
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
              Slug
            </th>
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
              Writer
            </th>
            <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200">{indexOfFirstItem + index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200">
                <img
                  src={CONFIG.BASE_URL + item.thumbnail}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </td>
              <td className="py-2 px-4 border-b border-gray-200">{item.title}</td>
              <td className="py-2 px-4 border-b border-gray-200">{item.slug}</td>
              <td className="py-2 px-4 border-b border-gray-200">{item.writer.profile.fullname}</td>
              <td className="py-2 px-4 border-b text-center border-gray-200">
                <div className="flex space-x-2 justify-center">
                  <Link
                    to={`/admin/artikel-manajemen/edit/${item._id}`}
                    className="px-3 py-1 text-sm font-semibold bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setSelectedArticle(item._id);
                    }}
                    className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* modal confirm */}
      <ModalConfirm
        message={"Apa anda ingin menghapus artikel ini"}
        isOpen={isOpen}
        cancelHandle={handleCloseModal}
        confirmHandle={handleDeleteModal}
      />
    </div>
  );
};

export default TableArtikel;

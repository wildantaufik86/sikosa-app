import React from "react";
import { Link } from "react-router-dom";

const TableArtikel = ({ data, currentPage, itemsPerPage }) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="overflow-x-auto border-2 shadow-xl border-gray-300 rounded-lg mb-6">
      <table className="w-full">
        <thead>
          <tr className="bg-[#EBF6FF]">
            <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
              No
            </th>
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
              Description
            </th>
            <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item) => (
            <tr key={item.no}>
              <td className="py-2 px-4 border-b border-gray-200">{item.no}</td>
              <td className="py-2 px-4 border-b border-gray-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {item.title}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {item.slug}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {item.description}
              </td>
              <td className="py-2 px-4 border-b text-center border-gray-200">
                <div className="flex space-x-2 justify-center">
                  <Link
                    to={`/admin/artikel-manajemen/edit/${item.no}`}
                    className="px-3 py-1 text-sm font-semibold bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                  >
                    Edit
                  </Link>
                  <button className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableArtikel;

import React, { useState } from "react";
import useSWR from "swr";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import { deleteUserById, getAllUsers } from "../../../utils/api";
import ModalConfirm from "../../../components/ModalConfirm";
import { toast } from "react-toastify";

const fetcher = async () => {
  const response = await getAllUsers();
  if (response.error) {
    throw new Error(response.message);
  }
  return response.users;
};

const UserAdmin = () => {
  const { data: users, error, mutate } = useSWR("/users", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const itemsPerPage = 10;

  if (error) {
    console.error(error.message);
  }

  const filteredData = users
    ? users.filter((user) =>
        user.profile.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchUsers = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleConfirmModal = async () => {
    try {
      if (!selectedUser) {
        throw new Error("Failed to delete user");
      }
      const response = await deleteUserById(selectedUser);
      if (response.error) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      setIsOpen(false);
      mutate(); // Revalidate data after deletion
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!users) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-16 lg:pt-5">
      <div className="mb-4 max-w-xs">
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 pl-10 border border-gray-500 rounded-lg text-sm"
            placeholder="Search "
            value={searchQuery}
            onChange={handleSearchUsers}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">
        User
      </h1>

      <div className="mb-5">
        <Link
          to="/admin/user/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Tambah User
        </Link>
      </div>

      <div className="overflow-x-auto border-2 shadow-xl border-gray-300 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-[#EBF6FF]">
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
                No
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-left border-gray-200">
                Nama
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
                Role
              </th>
              <th className="py-2 px-4 border-b text-m font-medium text-center border-gray-200">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((data, index) => (
              <tr key={data._id}>
                <td className="py-2 px-4 border-b border-gray-200">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {data.profile.fullname || "default " + data.role}
                </td>
                <td className="py-2 px-4 border-b text-center border-gray-200">
                  <span className="bg-[#35A7FF] text-white px-3 py-1 text-sm rounded-full">
                    {data.role}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center border-gray-200">
                  <Link
                    to={`/admin/user/edit-user/${data._id}`}
                    className="px-3 py-1 text-sm font-semibold bg-yellow-400 text-white rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setSelectedUser(data._id);
                    }}
                    className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-[#2B79D3] rounded-full mt-6 mx-auto w-max">
        <div className="flex justify-center space-x-2 p-1">
          <button
            className="px-3 py-1"
            onClick={() => paginate(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <IoIosArrowBack className="text-[#2B79D3]" />
          </button>
          {[...Array(totalPages).keys()].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 ${
                currentPage === index + 1
                  ? "bg-[#2B79D3] rounded-full text-white"
                  : "border-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="px-3 py-1"
            onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <IoIosArrowForward className="text-[#2B79D3]" />
          </button>
        </div>
      </div>
      <ModalConfirm
        message={"Anda yakin ingin menghapus user ini"}
        isOpen={isOpen}
        confirmHandle={handleConfirmModal}
        cancelHandle={handleCloseModal}
      />
    </div>
  );
};

export default UserAdmin;

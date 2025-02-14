import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/hooks";
import { updateProfile } from "../../../utils/api";
import CONFIG from "../../../config/config";
import { toast } from "react-toastify";

const EditProfile = () => {
  const { authUser, handleAuthUserChange } = useAuth();
  const [fullname, setFullname] = useState(
    authUser?.profile?.fullname || "User"
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser]);

  if (!authUser) {
    return null;
  }

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullname", fullname.trim());
      if (selectedImage) {
        formData.append("picture", selectedImage);
      }

      const result = await updateProfile(formData);
      if (result.error) {
        throw new Error(result.message);
      }
      if (result.data) {
        const { profile } = result.data;
        const updatedUser = { ...authUser, profile };
        handleAuthUserChange(updatedUser);
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedImage(file);
    }
  };

  return (
    <motion.section
      className="flex flex-col justify-center py-8 lg:py-10 px-6 lg:px-20 font-jakarta bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Title */}
      <motion.div
        className="mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-xl font-bold w-full text-left max-w-4xl">
          Edit Profil
        </h1>
      </motion.div>

      {/* Profile Card */}
      <article className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image */}
          <motion.aside
            className="w-full md:w-1/2 flex justify-center items-center border border-black rounded-xl p-2 mb-4 md:mb-0"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-[400px] h-80 object-cover rounded-lg"
              />
            ) : (
              <img
                src={
                  authUser.profile.picture
                    ? CONFIG.BASE_URL + authUser.profile.picture
                    : "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-[400px] h-80 object-cover rounded-lg"
              />
            )}
          </motion.aside>

          {/* Profile Details */}
          <motion.article
            className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <label
                    htmlFor="name"
                    className="text-black text-md font-semibold mb-1"
                  >
                    Nama
                  </label>
                  <input
                    id="name"
                    type="text"
                    defaultValue={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label
                    htmlFor="image"
                    className="text-black text-md font-semibold mb-1"
                  >
                    Add Image
                  </label>
                  <input
                    id="image"
                    type="file"
                    className="outline-none text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </motion.div>
              </div>

              {/* Save and Back Buttons */}
              <motion.div
                className="flex mt-4 space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Simpan
                </motion.button>
                <Link
                  to="/profile"
                  className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Kembali
                </Link>
              </motion.div>
            </form>
          </motion.article>
        </div>
      </article>
    </motion.section>
  );
};

export default EditProfile;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/hooks";
import CONFIG from "../../../config/config";
import { updateProfilePsikolog } from "../../../utils/api";

const EditProfilePsikolog = () => {
  const { authUser, handleAuthUserChange } = useAuth();

  const [fullname, setFullname] = useState(authUser?.profile?.fullname || "");
  const [description, setDescription] = useState(
    authUser?.profile.description || ""
  );
  const [specialization, setSpecialization] = useState(
    authUser?.profile.specialization || ""
  );
  const [educationBackground, setEducationBackground] = useState(
    authUser?.profile.educationBackground || []
  );
  const [educationInput, setEducationInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [disabledButton, setDisabledButton] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (educationInput.length > 0) {
      setDisabledButton(false);
    } else {
      setDisabledButton(true);
    }
  }, [educationInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("description", description);
      formData.append("specialization", specialization);
      if (selectedImage) {
        formData.append("picture", selectedImage);
      }

      educationBackground
        .filter((element) => element !== "")
        .forEach((element) => {
          formData.append("educationBackground[]", element);
        });

      if (educationBackground.length === 0) {
        formData.append("educationBackground[]", "");
      }

      const response = await updateProfilePsikolog(formData);
      if (response.error) {
        throw new Error(response.message);
      }

      const { profile: profileUpdated } = response.data;
      const updatedPsikolog = { ...authUser, profile: profileUpdated };
      handleAuthUserChange(updatedPsikolog);
      alert(response.message);
      navigate("/psikolog/profile");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddEducation = () => {
    if (educationInput.length > 0) {
      setEducationBackground([...educationBackground, educationInput]);
    }
    setEducationInput("");
  };

  const handleReset = () => {
    setEducationBackground([]);
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <section className="flex flex-col justify-center py-8 lg:py-10 px-6 lg:px-20 font-jakarta bg-white">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold w-full text-left max-w-4xl">
          Edit Profil
        </h1>
      </div>

      {/* Profile Card */}
      <article className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image */}
          <aside className="w-full md:w-1/2 flex justify-center items-center rounded-xl mb-4 h-80 md:mb-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <img
                src={
                  authUser?.profile?.picture
                    ? CONFIG.BASE_URL + authUser.profile.picture
                    : "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </aside>

          {/* Profile Details */}
          <article className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-black text-md font-semibold mb-1"
                >
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="specialization"
                  className="text-black text-md font-semibold mb-1"
                >
                  Spesialisasi
                </label>
                <input
                  id="specialization"
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="text-black text-md font-semibold mb-1"
                >
                  Riwayat Pendidikan
                </label>
                {educationBackground.length > 0 && (
                  <ul className="flex flex-col list-disc px-4 my-2">
                    {educationBackground
                      .filter((element) => element !== "")
                      .map((data, index) => (
                        <li key={index} className="text-xs">
                          {data}
                        </li>
                      ))}
                  </ul>
                )}

                <input
                  id="education"
                  type="text"
                  value={educationInput}
                  onChange={(e) => {
                    setEducationInput(e.target.value);
                  }}
                  className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    disabled={disabledButton}
                    className={`bg-green-500 text-[10px] font-semibold rounded-sm text-white py-1 px-2 cursor-pointer ${
                      disabledButton ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    Tambah
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`bg-red-500 text-[10px] font-semibold rounded-sm text-white py-1 px-2 cursor-pointer`}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="desc"
                  className="text-black text-md font-semibold mb-1"
                >
                  Profile singkat
                </label>
                <textarea
                  name="desc"
                  id="desc"
                  defaultValue={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full h-[150px]"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="text-black text-md font-semibold mb-1"
                >
                  Add image
                </label>
                <input
                  id="image"
                  type="file"
                  onChange={handleChangeImage}
                  className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full"
                />
              </div>
              {/* Save and Back Buttons */}
              <div className="flex mt-4 space-x-4">
                <button
                  type="submit"
                  className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Simpan
                </button>
                <Link
                  to="/psikolog/profile"
                  className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Kembali
                </Link>
              </div>
            </form>
          </article>
        </div>
      </article>
    </section>
  );
};

export default EditProfilePsikolog;

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/hooks";
import CONFIG from "../../../config/config";

const ProfilePsikolog = () => {
  const { authUser } = useAuth();

  return (
    <div className="flex flex-col justify-center py-8 lg:py-10 font-jakarta bg-white">
      {/* Title */}
      <h1 className="text-xl font-bold mb-4 w-full text-left max-w-4xl">
        Profil
      </h1>

      {/* Psikolog Card */}
      <div className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center rounded-xl h-80 mb-4 md:mb-0">
            {authUser?.profile?.picture ? (
              <img
                src={CONFIG.BASE_URL + authUser.profile.picture}
                alt="Profile"
                className="w-full h-80 object-cover rounded-lg"
              />
            ) : (
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="w-full h-80 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Profile Details */}
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div>
                <p className="text-black text-md font-semibold mb-1">Email</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">
                  {authUser.email}
                </p>
              </div>

              <div>
                <p className="text-black text-md font-semibold mb-1">Nama</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">
                  {authUser.profile.fullname || "USER DEFAULT"}
                </p>
              </div>

              <div>
                <p className="text-black text-md font-semibold mb-1">
                  Profile Singkat
                </p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">
                  {authUser?.profile.description || "Tidak ada profil"}
                </p>
              </div>
              <div>
                <p className="text-black text-md font-semibold mb-1">
                  Spesialisasi
                </p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">
                  {authUser?.profile.specialization || "Tambahkan Spesialisasi"}
                </p>
              </div>
              <div>
                <p className="text-black text-md font-semibold mb-1">Role</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">
                  {authUser.role}
                </p>
              </div>
            </div>
            <div>
              <p className="text-black text-md font-semibold mb-1">
                Riwayat Pendidikan
              </p>
              {authUser.profile.educationBackground.length !== 0 ? (
                <ul className="list-disc px-4 flex flex-col gap-2">
                  {authUser?.profile.educationBackground
                    .filter((element) => element !== "")
                    .map((data, index) => (
                      <li key={index} className="text-xs">
                        {data}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-xs">tidak ada riwayat pendidikan</p>
              )}
            </div>
            {/* Edit Profile Button */}
            <div className="mt-4">
              <Link
                to={`/psikolog/edit-profile/${authUser._id}`}
                className="mt-4 bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 self-start"
              >
                Edit Profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePsikolog;

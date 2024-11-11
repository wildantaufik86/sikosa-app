import React from "react";
import { Link } from "react-router-dom";

const ProfilePsikolog = () => {
  return (
    <div className="flex flex-col justify-center py-8 lg:py-10 font-jakarta bg-white">
      {/* Title */}
      <h1 className="text-xl font-bold mb-4 w-full text-left max-w-4xl">Profil</h1>

      {/* Psikolog Card */}
      <div className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center border border-black rounded-xl p-2 mb-4 md:mb-0">
            <img src="/assets/caroulsel1.png" alt="Profile" className="w-full h-80 object-cover rounded-lg" />
          </div>

          {/* Profile Details */}
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-black text-md font-semibold mb-1">NIM</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">123456789</p>
              </div>

              <div>
                <p className="text-black text-md font-semibold mb-1">Nama</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">Nama Mahasiswa</p>
              </div>

              <div>
                <p className="text-black text-md font-semibold mb-1">Tanggal Lahir</p>
                <p className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm">01 Januari 2000</p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div>
              <Link to="/psikolog/edit-profile/1" className="mt-4 bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 self-start">
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

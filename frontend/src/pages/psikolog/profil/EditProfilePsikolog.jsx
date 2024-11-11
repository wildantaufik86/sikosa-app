import React from "react";
import { Link } from "react-router-dom";

const EditProfilePsikolog = () => {
  return (
    <section className="flex flex-col justify-center py-8 lg:py-10 px-6 lg:px-20 font-jakarta bg-white">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold w-full text-left max-w-4xl">Edit Profil</h1>
      </div>

      {/* Profile Card */}
      <article className="w-full max-w-2xl lg:p-4 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image */}
          <aside className="w-full md:w-1/2 flex justify-center items-center border border-black rounded-xl p-2 mb-4 md:mb-0">
            <img src="/assets/caroulsel1.png" alt="Profile" className="w-full h-80 object-cover rounded-lg" />
          </aside>

          {/* Profile Details */}
          <article className="w-full md:w-1/2 md:pl-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label htmlFor="nim" className="text-black text-md font-semibold mb-1">
                  NIM
                </label>
                <input id="nim" type="text" defaultValue="123456789" className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full" />
              </div>

              <div>
                <label htmlFor="name" className="text-black text-md font-semibold mb-1">
                  Nama
                </label>
                <input id="name" type="text" defaultValue="Nama Mahasiswa" className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full" />
              </div>

              <div>
                <label htmlFor="dob" className="text-black text-md font-semibold mb-1">
                  Tanggal Lahir
                </label>
                <input id="dob" type="text" defaultValue="01 Januari 2000" className="text-gray-700 text-md bg-gray-100 p-1 rounded-sm w-full" />
              </div>
            </div>

            {/* Save and Back Buttons */}
            <div className="flex mt-4 space-x-4">
              <button className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600">Simpan</button>
              <Link to="/psikolog/profile" className="bg-[#35A7FF] text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-blue-600">
                Kembali
              </Link>
            </div>
          </article>
        </div>
      </article>
    </section>
  );
};

export default EditProfilePsikolog;

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { getPsikologById } from "../../../utils/api";
import { useAuth } from "../../../hooks/hooks";

const psikologData = [
  {
    id: 1,
    name: "Psikolog A",
    image: "https://via.placeholder.com/150",
    profile:
      "Psikolog A has extensive experience in therapy for anxiety, depression, and relationship issues. ",
    education: [
      "S1 Psikologi - Universitas X",
      "S2 Psikologi Klinis - Universitas Y",
    ],
  },
  {
    id: 2,
    name: "Psikolog B",
    image: "https://via.placeholder.com/150",
    profile:
      "Psikolog B specializes in cognitive behavioral therapy and family counseling.",
    education: [
      "S1 Psikologi - Universitas Z",
      "S2 Psikologi Klinis - Universitas W",
    ],
  },
];

const DetailPsikolog = () => {
  const psikolog = psikologData[0];
  const { id_psikolog } = useParams();
  const [psikologDetail, setPsikologDetail] = useState(null);

  const { authUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPsikologById(id_psikolog);
        if (result.error) {
          throw new Error(result.message);
        }
        setPsikologDetail(result.data);
      } catch (error) {
        alert(error.message);
      }
    };
    if (authUser) {
      fetchData();
    }
  }, [authUser, id_psikolog]);

  if (!psikologDetail) {
    return null;
  }

  return (
    <div className="py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-700 flex items-center space-x-2">
        <Link to="/" className="hover:text-blue-500">
          Beranda
        </Link>{" "}
        <span>&gt;</span>
        <Link to="/daftar-layanan" className="hover:text-blue-500">
          Daftar Layanan
        </Link>{" "}
        <span>&gt;</span>
        <span className="font-semibold">{psikolog.name}</span>
      </div>

      <Link
        to="/daftar-layanan"
        className="border-2 mb-3 border-black p-2 rounded-full flex items-center justify-center w-10 h-10"
      >
        <FaChevronLeft className="text-black" />
      </Link>

      {/* Detail Psikolog Section */}
      <div className="max-w-xl mx-auto border p-4 rounded-lg shadow-lg">
        {/* Psikolog Image */}
        <img
          src={psikolog.image}
          alt={psikolog.name}
          className="w-full h-80 object-cover mb-4 rounded-md mx-auto"
        />

        {/* Psikolog Name */}
        <h3 className="text-2xl text-[#35A7FF] font-semibold text-left my-5">
          {psikologDetail?.profile.fullname}
        </h3>

        {/* Psikolog Profile */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2 text-left">
            Profil Dokter
          </h4>
          <p className="text-gray-700 mb-4 p-2 text-md font-medium text-justify rounded-md border border-[#35A7FF]">
            {psikolog.profile}
          </p>
        </div>

        {/* Education History */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2 text-left">
            Riwayat Pendidikan:
          </h4>
          <ul className="list-disc pl-6 text-gray-700 p-2 text-md font-medium text-justify rounded-md border border-[#35A7FF]">
            {psikolog.education.map((edu, index) => (
              <li key={index} className="mb-2">
                {edu}
              </li>
            ))}
          </ul>
        </div>

        {/* Centered Chat Button */}
        <div className="flex justify-center">
          <Link
            to={`/chat-dokter/${psikologDetail._id}`}
            className="bg-[#35A7FF] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5DB9FF]"
          >
            Chat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailPsikolog;

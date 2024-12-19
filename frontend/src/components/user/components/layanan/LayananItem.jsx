import React from "react";
import CONFIG from "../../../../config/config";
import { formattedString } from "../../../../utils/utils";
import { Link } from "react-router-dom";

const LayananItem = ({ data }) => {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <img
        src={CONFIG.BASE_URL + data.profile.picture}
        alt={data.profile.fullname}
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="mt-2 font-semibold text-sm text-center  my-3">
        {formattedString(data.profile.fullname)}
      </h2>
      <p className="text-[10px] font-light border-b border-black pb-1">
        {data.profile.specialization}
      </p>
      <Link
        to={`/daftar-layanan/${data.id}`}
        className="mt-4 bg-blue-600 font-semibold text-white text-xs py-2 px-3 rounded-md hover:bg-[#86CAFF] transition flex justify-center items-center"
      >
        Detail
      </Link>
    </div>
  );
};

export default LayananItem;

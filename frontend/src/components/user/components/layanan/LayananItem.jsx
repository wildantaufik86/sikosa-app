import React from "react";

const LayananItem = ({ layanan }) => {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <img src={layanan.image} alt={layanan.name} className="w-full h-40 object-cover rounded-md" />
      <h2 className="mt-2 font-semibold text-lg text-[#35A7FF] my-3">{layanan.name}</h2>
      <p className="text-gray-600">{layanan.description}</p>
      <button className="mt-4 bg-[#86CAFF] font-semibold text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition mx-auto block">Chat</button>
    </div>
  );
};

export default LayananItem;

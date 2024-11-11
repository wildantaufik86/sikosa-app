import React from "react";
import DaftarLayanan from "./landing/DaftarLayanan";
import Beranda from "./landing/Beranda";
import ArtikelPage from "./landing/Artikel";
import RiwayatPage from "./landing/Riwayat";

const Home = () => {
  return (
    <>
      <Beranda />
      <RiwayatPage />
      <DaftarLayanan />
      <ArtikelPage />
    </>
  );
};

export default Home;

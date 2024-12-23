import React from "react";
import DaftarLayanan from "./landing/DaftarLayanan";
import Beranda from "./landing/Beranda";
import ArtikelPage from "./landing/Artikel";
import RiwayatPage from "./landing/Riwayat";
import AboutSikosa from "./landing/AboutSikosa";
import FiturSikosa from "./landing/FiturSikosa";
import Faq from "./landing/Faq";

const Home = () => {
  return (
    <>
      <Beranda />
      <RiwayatPage />
      <AboutSikosa />
      <FiturSikosa />
      <DaftarLayanan />
      <ArtikelPage />
      <Faq />
    </>
  );
};

export default Home;

import React from "react";
import RightSection from "../../../components/user/components/beranda/RightSection";
import LeftSection from "../../../components/user/components/beranda/Leftsection.jsx";
const Beranda = () => {
  return (
    <>
      <div className="w-full lg:h-screen mx-auto py-8 lg:py-0 px-8 md:px-20 lg:px-28 flex flex-col md:flex-row items-center justify-center">
        {/* Right Section */}
        <RightSection />

        {/* Left Section  */}
        <LeftSection />
      </div>
    </>
  );
};

export default Beranda;

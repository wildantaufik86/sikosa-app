import React from "react";
import RightSection from "../../../components/user/components/beranda/RightSection";
import LeftSection from "../../../components/user/components/beranda/LeftSection";
const Beranda = () => {
  return (
    <>
      <div className="container lg:h-screen mx-auto py-8 lg:py-0 px-6 lg:px-20 flex flex-col md:flex-row items-center justify-center">
        {/* Right Section */}
        <RightSection />

        {/* Left Section  */}
        <LeftSection />
      </div>
    </>
  );
};

export default Beranda;

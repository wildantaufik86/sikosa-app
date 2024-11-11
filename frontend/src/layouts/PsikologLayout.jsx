import React from "react";
import PsikologSidebar from "../components/psikolog/components/Sidebar";
import Footer from "../components/Footer";

const PsikologLayout = ({ children }) => {
  return (
    <>
      <div className="bg-white min-h-screen flex flex-col">
        {/* Apply flex-col on mobile and tablet, and flex-row on desktop */}
        <div className="flex flex-col lg:flex-row flex-1">
          <PsikologSidebar />
          <main className="flex-1 p-5 overflow-y-auto  lg:h-screen">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PsikologLayout;

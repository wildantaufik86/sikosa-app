import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ArtikelPage from "../landing/Artikel";

const Artikel = () => {
  // Array of images for the carousel
  const images = ["/assets/caroulsel1.png", "/assets/caroulsel2.png", "/assets/caroulsel3.png"];

  // State to track the current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to go to the next image
  const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative w-full">
        {/* Carousel Background Image */}
        <div
          className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-cover bg-center flex items-center justify-center transition duration-500"
          style={{
            backgroundImage: `url(${images[currentIndex]})`,
          }}
        >
          {/* Carousel Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10 lg:px-20">
            <button onClick={prevImage} className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-200">
              <FaChevronLeft size={24} />
            </button>
            <button onClick={nextImage} className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-200">
              <FaChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <ArtikelPage />
    </>
  );
};

export default Artikel;
